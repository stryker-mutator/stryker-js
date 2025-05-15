import childProcess from 'child_process';
import os from 'os';
import { fileURLToPath, URL } from 'url';

import { FileDescriptions, StrykerOptions } from '@stryker-mutator/api/core';
import {
  isErrnoException,
  Task,
  ExpirableTask,
  StrykerError,
} from '@stryker-mutator/util';
import { Disposable, InjectableClass, InjectionToken } from 'typed-inject';

import { LoggingServerAddress } from '../logging/index.js';
import { objectUtils } from '../utils/object-utils.js';
import { StringBuilder } from '../utils/string-builder.js';
import { deserialize, padLeft, serialize } from '../utils/string-utils.js';

import { ChildProcessCrashedError } from './child-process-crashed-error.js';
import {
  InitMessage,
  ParentMessage,
  ParentMessageKind,
  WorkerMessage,
  WorkerMessageKind,
} from './message-protocol.js';
import { OutOfMemoryError } from './out-of-memory-error.js';
import { ChildProcessContext } from './child-process-proxy-worker.js';
import { IdGenerator } from './id-generator.js';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';

type Func<TS extends any[], R> = (...args: TS) => R;

type PromisifiedFunc<TS extends any[], R> = (...args: TS) => Promise<R>;

export type Promisified<T> = {
  [K in keyof T]: T[K] extends PromisifiedFunc<any, any>
    ? T[K]
    : T[K] extends Func<infer TS, infer R>
      ? PromisifiedFunc<TS, R>
      : () => Promise<T[K]>;
};

const BROKEN_PIPE_ERROR_CODE = 'EPIPE';
const IPC_CHANNEL_CLOSED_ERROR_CODE = 'ERR_IPC_CHANNEL_CLOSED';
const TIMEOUT_FOR_DISPOSE = 2000;

export class ChildProcessProxy<T> implements Disposable {
  public readonly proxy: Promisified<T>;

  private readonly worker: childProcess.ChildProcess;
  private readonly initTask: Task;
  private disposeTask: ExpirableTask | undefined;
  private fatalError: StrykerError | undefined;
  private readonly workerTasks = new Map<number, Task>();
  private workerTaskCounter = 0;
  private readonly log;
  private readonly stdoutBuilder = new StringBuilder();
  private readonly stderrBuilder = new StringBuilder();
  private isDisposed = false;
  private readonly initMessage: InitMessage;

  private constructor(
    modulePath: string,
    namedExport: string,
    loggingServerAddress: LoggingServerAddress,
    options: StrykerOptions,
    fileDescriptions: FileDescriptions,
    pluginModulePaths: readonly string[],
    workingDirectory: string,
    logger: Logger,
    execArgv: string[],
    idGenerator: IdGenerator,
  ) {
    const workerId = idGenerator.next().toString();
    this.worker = childProcess.fork(
      fileURLToPath(
        new URL('./child-process-proxy-worker.js', import.meta.url),
      ),
      {
        silent: true,
        execArgv,
        env: { STRYKER_MUTATOR_WORKER: workerId, ...process.env },
      },
    );
    this.initTask = new Task();
    this.log = logger;
    this.log.debug(
      'Started %s in worker process %s with pid %s %s',
      namedExport,
      workerId,
      this.worker.pid,
      execArgv.length ? ` (using args ${execArgv.join(' ')})` : '',
    );
    // Listen to `close`, not `exit`, see https://github.com/stryker-mutator/stryker-js/issues/1634
    this.worker.on('close', this.handleUnexpectedExit);
    this.worker.on('error', this.handleError);

    this.initMessage = {
      kind: WorkerMessageKind.Init,
      loggingServerAddress,
      options,
      fileDescriptions,
      pluginModulePaths,
      namedExport: namedExport,
      modulePath: modulePath,
      workingDirectory,
    };
    this.listenForMessages();
    this.listenToStdoutAndStderr();

    this.proxy = this.initProxy();
  }

  /**
   * @description Creates a proxy where each function of the object created using the constructorFunction arg is ran inside of a child process
   */
  public static create<
    R,
    Tokens extends Array<InjectionToken<ChildProcessContext>>,
  >(
    modulePath: string,
    loggingServerAddress: LoggingServerAddress,
    options: StrykerOptions,
    fileDescriptions: FileDescriptions,
    pluginModulePaths: readonly string[],
    workingDirectory: string,
    injectableClass: InjectableClass<ChildProcessContext, R, Tokens>,
    execArgv: string[],
    getLogger: LoggerFactoryMethod,
    idGenerator: IdGenerator,
  ): ChildProcessProxy<R> {
    return new ChildProcessProxy(
      modulePath,
      injectableClass.name,
      loggingServerAddress,
      options,
      fileDescriptions,
      pluginModulePaths,
      workingDirectory,
      getLogger(ChildProcessProxy.name),
      execArgv,
      idGenerator,
    );
  }

  private send(message: WorkerMessage) {
    this.worker.send(serialize(message));
  }

  private initProxy(): Promisified<T> {
    // This proxy is a genuine javascript `Proxy` class
    // More info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
    return new Proxy({} as Promisified<T>, {
      get: (_, propertyKey) => {
        if (typeof propertyKey === 'string') {
          return this.forward(propertyKey);
        } else {
          return undefined;
        }
      },
    });
  }

  private forward(methodName: string) {
    return async (...args: any[]) => {
      if (this.fatalError) {
        return Promise.reject(this.fatalError);
      } else {
        const workerTask = new Task<void>();
        const correlationId = this.workerTaskCounter++;
        this.workerTasks.set(correlationId, workerTask);
        this.initTask.promise
          .then(() => {
            this.send({
              args,
              correlationId,
              kind: WorkerMessageKind.Call,
              methodName,
            });
          })
          .catch((error: unknown) => {
            workerTask.reject(error);
          });
        return workerTask.promise;
      }
    };
  }

  private listenForMessages() {
    this.worker.on('message', (serializedMessage: string) => {
      const message = deserialize<ParentMessage>(serializedMessage);
      switch (message.kind) {
        case ParentMessageKind.Ready:
          // Workaround, because of a race condition more prominent in native ESM node modules
          // Fix has landed in v17.4.0 🎉, but we need this workaround for now.
          // See https://github.com/nodejs/node/issues/41134
          this.send(this.initMessage);
          break;
        case ParentMessageKind.Initialized:
          this.initTask.resolve(undefined);
          break;
        case ParentMessageKind.CallResult:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          this.workerTasks.get(message.correlationId)!.resolve(message.result);
          this.workerTasks.delete(message.correlationId);
          break;
        case ParentMessageKind.CallRejection:
          this.workerTasks
            .get(message.correlationId)!
            .reject(new StrykerError(message.error));
          this.workerTasks.delete(message.correlationId);
          break;
        case ParentMessageKind.DisposeCompleted:
          if (this.disposeTask) {
            this.disposeTask.resolve(undefined);
          }
          break;
        case ParentMessageKind.InitError:
          this.fatalError = new StrykerError(message.error);
          this.reportError(this.fatalError);
          void this.dispose();
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
      this.log.trace(output);
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
    const onGoingWorkerTasks = [...this.workerTasks.values()].filter(
      (task) => !task.isCompleted,
    );
    if (!this.initTask.isCompleted) {
      onGoingWorkerTasks.push(this.initTask);
    }
    if (onGoingWorkerTasks.length) {
      onGoingWorkerTasks.forEach((task) => task.reject(error));
    }
  }

  private readonly handleUnexpectedExit = (code: number, signal: string) => {
    this.isDisposed = true;
    const output = StringBuilder.concat(this.stderrBuilder, this.stdoutBuilder);
    if (processOutOfMemory()) {
      const oom = new OutOfMemoryError(this.worker.pid, code);
      this.fatalError = oom;
      this.log.warn(
        `Child process [pid ${oom.pid}] ran out of memory. Stdout and stderr are logged on debug level.`,
      );
      this.log.debug(stdoutAndStderr());
    } else {
      this.fatalError = new ChildProcessCrashedError(
        this.worker.pid,
        `Child process [pid ${this.worker.pid}] exited unexpectedly with exit code ${code} (${signal || 'without signal'}). ${stdoutAndStderr()}`,
        code,
        signal,
      );
      this.log.warn(this.fatalError.message, this.fatalError);
    }

    this.reportError(this.fatalError);

    function processOutOfMemory() {
      return (
        output.includes('JavaScript heap out of memory') ||
        output.includes('FatalProcessOutOfMemory')
      );
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
      this.log.warn(
        `Child process [pid ${this.worker.pid}] has crashed. See other warning messages for more info.`,
        error,
      );
      this.reportError(
        new ChildProcessCrashedError(
          this.worker.pid,
          `Child process [pid ${this.worker.pid}] has crashed`,
          undefined,
          undefined,
          error,
        ),
      );
    } else {
      this.reportError(error);
    }
  };

  private innerProcessIsCrashed(error: Error) {
    return (
      isErrnoException(error) &&
      (error.code === BROKEN_PIPE_ERROR_CODE ||
        error.code === IPC_CHANNEL_CLOSED_ERROR_CODE)
    );
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
        await objectUtils.kill(this.worker.pid);
      }
    }
  }

  private logUnidentifiedMessage(message: never) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.log.error(`Received unidentified message ${message}`);
  }
}
