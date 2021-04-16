import childProcess from 'child_process';
import os from 'os';

import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { PluginContext } from '@stryker-mutator/api/plugin';
import { isErrnoException, Task, ExpirableTask } from '@stryker-mutator/util';
import { getLogger } from 'log4js';
import { Disposable, InjectableClass, InjectionToken } from 'typed-inject';

import { LoggingClientContext } from '../logging';
import { deserialize, kill, padLeft, serialize } from '../utils/object-utils';
import { StringBuilder } from '../utils/string-builder';

import { ChildProcessCrashedError } from './child-process-crashed-error';
import { autoStart, ParentMessage, ParentMessageKind, WorkerMessage, WorkerMessageKind } from './message-protocol';
import { OutOfMemoryError } from './out-of-memory-error';

type Func<TS extends any[], R> = (...args: TS) => R;

type PromisifiedFunc<TS extends any[], R> = (...args: TS) => Promise<R>;

export type Promisified<T> = {
  [K in keyof T]: T[K] extends PromisifiedFunc<any, any> ? T[K] : T[K] extends Func<infer TS, infer R> ? PromisifiedFunc<TS, R> : () => Promise<T[K]>;
};

const BROKEN_PIPE_ERROR_CODE = 'EPIPE';
const IPC_CHANNEL_CLOSED_ERROR_CODE = 'ERR_IPC_CHANNEL_CLOSED';
const TIMEOUT_FOR_DISPOSE = 2000;

export class ChildProcessProxy<T> implements Disposable {
  public readonly proxy: Promisified<T>;

  private readonly worker: childProcess.ChildProcess;
  private readonly initTask: Task;
  private disposeTask: ExpirableTask | undefined;
  private currentError: ChildProcessCrashedError | undefined;
  private readonly workerTasks: Task[] = [];
  private readonly log = getLogger(ChildProcessProxy.name);
  private readonly stdoutBuilder = new StringBuilder();
  private readonly stderrBuilder = new StringBuilder();
  private isDisposed = false;

  private constructor(
    requirePath: string,
    requireName: string,
    loggingContext: LoggingClientContext,
    options: StrykerOptions,
    additionalInjectableValues: unknown,
    workingDirectory: string,
    execArgv: string[]
  ) {
    this.worker = childProcess.fork(require.resolve('./child-process-proxy-worker'), [autoStart], { silent: true, execArgv });
    this.initTask = new Task();
    this.log.debug('Started %s in child process %s%s', requireName, this.worker.pid, execArgv.length ? ` (using args ${execArgv.join(' ')})` : '');
    this.send({
      additionalInjectableValues,
      kind: WorkerMessageKind.Init,
      loggingContext,
      options,
      requireName,
      requirePath,
      workingDirectory,
    });
    this.listenForMessages();
    this.listenToStdoutAndStderr();
    // Listen to `close`, not `exit`, see https://github.com/stryker-mutator/stryker-js/issues/1634
    this.worker.on('close', this.handleUnexpectedExit);
    this.worker.on('error', this.handleError);
    this.proxy = this.initProxy();
  }

  /**
   * @description Creates a proxy where each function of the object created using the constructorFunction arg is ran inside of a child process
   */
  public static create<TAdditionalContext, R, Tokens extends Array<InjectionToken<PluginContext & TAdditionalContext>>>(
    requirePath: string,
    loggingContext: LoggingClientContext,
    options: StrykerOptions,
    additionalInjectableValues: TAdditionalContext,
    workingDirectory: string,
    injectableClass: InjectableClass<PluginContext & TAdditionalContext, R, Tokens>,
    execArgv: string[]
  ): ChildProcessProxy<R> {
    return new ChildProcessProxy(requirePath, injectableClass.name, loggingContext, options, additionalInjectableValues, workingDirectory, execArgv);
  }

  private send(message: WorkerMessage) {
    this.worker.send(serialize(message, [File]));
  }

  private initProxy(): Promisified<T> {
    // This proxy is a genuine javascript `Proxy` class
    // More info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
    const self = this;
    return new Proxy({} as Promisified<T>, {
      get(_, propertyKey) {
        if (typeof propertyKey === 'string') {
          return self.forward(propertyKey);
        } else {
          return undefined;
        }
      },
    });
  }

  private forward(methodName: string) {
    return async (...args: any[]) => {
      if (this.currentError) {
        return Promise.reject(this.currentError);
      } else {
        const workerTask = new Task<void>();
        const correlationId = this.workerTasks.push(workerTask) - 1;
        this.initTask.promise.then(() => {
          this.send({
            args,
            correlationId,
            kind: WorkerMessageKind.Call,
            methodName,
          });
        });
        return workerTask.promise;
      }
    };
  }

  private listenForMessages() {
    this.worker.on('message', (serializedMessage: string) => {
      const message: ParentMessage = deserialize(serializedMessage, [File]);
      switch (message.kind) {
        case ParentMessageKind.Initialized:
          this.initTask.resolve(undefined);
          break;
        case ParentMessageKind.Result:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          this.workerTasks[message.correlationId].resolve(message.result);
          delete this.workerTasks[message.correlationId];
          break;
        case ParentMessageKind.Rejection:
          this.workerTasks[message.correlationId].reject(new Error(message.error));
          delete this.workerTasks[message.correlationId];
          break;
        case ParentMessageKind.DisposeCompleted:
          if (this.disposeTask) {
            this.disposeTask.resolve(undefined);
          }
          break;
        default:
          this.logUnidentifiedMessage(message);
          break;
      }
    });
  }

  private listenToStdoutAndStderr() {
    const handleData = (builder: StringBuilder) => (data: Buffer | string) => {
      const output = data.toString();
      builder.append(output);
      if (this.log.isTraceEnabled()) {
        this.log.trace(output);
      }
    };

    if (this.worker.stdout) {
      this.worker.stdout.on('data', handleData(this.stdoutBuilder));
    }

    if (this.worker.stderr) {
      this.worker.stderr.on('data', handleData(this.stderrBuilder));
    }
  }

  public get stdout(): string {
    return this.stdoutBuilder.toString();
  }

  public get stderr(): string {
    return this.stderrBuilder.toString();
  }

  private reportError(error: Error) {
    this.workerTasks.filter((task) => !task.isCompleted).forEach((task) => task.reject(error));
  }

  private readonly handleUnexpectedExit = (code: number, signal: string) => {
    this.isDisposed = true;
    const output = StringBuilder.concat(this.stderrBuilder, this.stdoutBuilder);
    if (processOutOfMemory()) {
      this.currentError = new OutOfMemoryError(this.worker.pid, code);
      this.log.warn(`Child process [pid ${this.currentError.pid}] ran out of memory. Stdout and stderr are logged on debug level.`);
      this.log.debug(stdoutAndStderr());
    } else {
      this.currentError = new ChildProcessCrashedError(
        this.worker.pid,
        `Child process [pid ${this.worker.pid}] exited unexpectedly with exit code ${code} (${signal || 'without signal'}). ${stdoutAndStderr()}`,
        code,
        signal
      );
      this.log.warn(this.currentError.message, this.currentError);
    }

    this.reportError(this.currentError);

    function processOutOfMemory() {
      return output.includes('JavaScript heap out of memory') || output.includes('FatalProcessOutOfMemory');
    }

    function stdoutAndStderr() {
      if (output.length) {
        return `Last part of stdout and stderr was:${os.EOL}${padLeft(output)}`;
      } else {
        return 'Stdout and stderr were empty.';
      }
    }
  };

  private readonly handleError = (error: Error) => {
    if (this.innerProcessIsCrashed(error)) {
      this.log.warn(`Child process [pid ${this.worker.pid}] has crashed. See other warning messages for more info.`, error);
      this.reportError(
        new ChildProcessCrashedError(this.worker.pid, `Child process [pid ${this.worker.pid}] has crashed`, undefined, undefined, error)
      );
    } else {
      this.reportError(error);
    }
  };

  private innerProcessIsCrashed(error: Error) {
    return isErrnoException(error) && (error.code === BROKEN_PIPE_ERROR_CODE || error.code === IPC_CHANNEL_CLOSED_ERROR_CODE);
  }

  public async dispose(): Promise<void> {
    if (!this.isDisposed) {
      this.worker.removeListener('close', this.handleUnexpectedExit);
      this.isDisposed = true;
      this.log.debug('Disposing of worker process %s', this.worker.pid);
      this.disposeTask = new ExpirableTask(TIMEOUT_FOR_DISPOSE);
      this.send({ kind: WorkerMessageKind.Dispose });
      try {
        await this.disposeTask.promise;
      } finally {
        this.log.debug('Kill %s', this.worker.pid);
        await kill(this.worker.pid);
      }
    }
  }

  private logUnidentifiedMessage(message: never) {
    this.log.error(`Received unidentified message ${message}`);
  }
}
