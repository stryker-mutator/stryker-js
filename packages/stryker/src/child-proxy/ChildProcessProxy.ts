import * as os from 'os';
import { fork, ChildProcess } from 'child_process';
import { File } from 'stryker-api/core';
import { getLogger } from 'stryker-api/logging';
import { WorkerMessage, WorkerMessageKind, ParentMessage, autoStart, ParentMessageKind } from './messageProtocol';
import { serialize, deserialize, kill, isErrnoException, padLeft } from '../utils/objectUtils';
import { Task, ExpirableTask } from '../utils/Task';
import LoggingClientContext from '../logging/LoggingClientContext';
import ChildProcessCrashedError from './ChildProcessCrashedError';
import OutOfMemoryError from './OutOfMemoryError';
import StringBuilder from '../utils/StringBuilder';

interface Func<TS extends any[], R> {
  (...args: TS): R;
}
interface PromisifiedFunc<TS extends any[], R> {
  (...args: TS): Promise<R>;
}
interface Constructor<T, TS extends any[]> {
  new (...args: TS): T;
}
export type Promisified<T> = {
  [K in keyof T]: T[K] extends PromisifiedFunc<any, any> ? T[K] : T[K] extends Func<infer TS, infer R> ? PromisifiedFunc<TS, R> : () => Promise<T[K]>;
};

const BROKEN_PIPE_ERROR_CODE = 'EPIPE';
const IPC_CHANNEL_CLOSED_ERROR_CODE = 'ERR_IPC_CHANNEL_CLOSED';
const TIMEOUT_FOR_DISPOSE = 2000;

export default class ChildProcessProxy<T> {
  readonly proxy: Promisified<T>;

  private worker: ChildProcess;
  private initTask: Task;
  private disposeTask: ExpirableTask<void> | undefined;
  private currentError: ChildProcessCrashedError | undefined;
  private workerTasks: Task<any>[] = [];
  private log = getLogger(ChildProcessProxy.name);
  private stdoutAndStderrBuilder = new StringBuilder();
  private isDisposed = false;

  private constructor(requirePath: string, loggingContext: LoggingClientContext, plugins: string[], workingDirectory: string, constructorParams: any[]) {
    this.worker = fork(require.resolve('./ChildProcessProxyWorker'), [autoStart], { silent: true, execArgv: [] });
    this.initTask = new Task();
    this.log.debug('Starting %s in child process %s', requirePath, this.worker.pid);
    this.send({
      kind: WorkerMessageKind.Init,
      loggingContext,
      plugins,
      requirePath,
      constructorArgs: constructorParams,
      workingDirectory
    });
    this.listenForMessages();
    this.listenToStdoutAndStderr();
    // This is important! Be sure to bind to `this`
    this.handleUnexpectedExit = this.handleUnexpectedExit.bind(this);
    this.handleError = this.handleError.bind(this);
    this.worker.on('exit', this.handleUnexpectedExit);
    this.worker.on('error', this.handleError);
    this.proxy = this.initProxy();
  }

  /**
  * Creates a proxy where each function of the object created using the constructorFunction arg is ran inside of a child process
  */
  static create<T, TS extends any[]>(requirePath: string, loggingContext: LoggingClientContext, plugins: string[], workingDirectory: string, _:  Constructor<T, TS>, ...constructorArgs: TS):
    ChildProcessProxy<T> {
    return new ChildProcessProxy(requirePath, loggingContext, plugins, workingDirectory, constructorArgs);
  }

  private send(message: WorkerMessage) {
    this.worker.send(serialize(message));
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
      }
    });
  }

  private forward(methodName: string) {
    return (...args: any[]) => {
      if (this.currentError) {
        return Promise.reject(this.currentError);
      } else {
        const workerTask = new Task<any>();
        const correlationId = this.workerTasks.push(workerTask) - 1;
        this.initTask.promise.then(() => {
          this.send({
            kind: WorkerMessageKind.Call,
            correlationId,
            methodName,
            args
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
    const handleData = (data: Buffer | string) => {
      const output = data.toString();
      this.stdoutAndStderrBuilder.append(output);
      if (this.log.isTraceEnabled()) {
        this.log.trace(output);
      }
    };

    if (this.worker.stdout) {
      this.worker.stdout.on('data', handleData);
    }

    if (this.worker.stderr) {
      this.worker.stderr.on('data', handleData);
    }
  }

  private reportError(error: Error) {
    this.workerTasks
      .filter(task => !task.isCompleted)
      .forEach(task => task.reject(error));
  }

  private handleUnexpectedExit(code: number, signal: string) {
    this.isDisposed = true;
    const output = this.stdoutAndStderrBuilder.toString();

    if (processOutOfMemory()) {
      this.currentError = new OutOfMemoryError(this.worker.pid, code);
      this.log.warn(`Child process [pid ${this.currentError.pid}] ran out of memory. Stdout and stderr are logged on debug level.`);
      this.log.debug(stdoutAndStderr());
    } else {
      this.currentError = new ChildProcessCrashedError(this.worker.pid, `Child process [pid ${this.worker.pid}] exited unexpectedly with exit code ${code} (${signal || 'without signal'}). ${stdoutAndStderr()}`, code, signal);
      this.log.warn(this.currentError.message, this.currentError);
    }

    this.reportError(this.currentError);

    function processOutOfMemory() {
      return output.indexOf('JavaScript heap out of memory') >= 0;
    }

    function stdoutAndStderr() {
      if (output.length) {
        return `Last part of stdout and stderr was:${os.EOL}${padLeft(output)}`;
      } else {
        return 'Stdout and stderr were empty.';
      }
    }
  }

  private handleError(error: Error) {
    if (this.innerProcessIsCrashed(error)) {
      this.log.warn(`Child process [pid ${this.worker.pid}] has crashed. See other warning messages for more info.`, error);
      this.reportError(new ChildProcessCrashedError(this.worker.pid, `Child process [pid ${this.worker.pid}] has crashed`, undefined, undefined, error));
    } else {
      this.reportError(error);
    }
  }

  private innerProcessIsCrashed(error: any) {
    return isErrnoException(error) && (error.code === BROKEN_PIPE_ERROR_CODE || error.code === IPC_CHANNEL_CLOSED_ERROR_CODE);
  }

  public dispose(): Promise<void> {
    this.worker.removeListener('exit', this.handleUnexpectedExit);
    if (this.isDisposed) {
      return Promise.resolve();
    } else {
      this.log.debug('Disposing of worker process %s', this.worker.pid);
      const killWorker = () => {
        this.log.debug('Kill %s', this.worker.pid);
        kill(this.worker.pid);
        this.isDisposed = true;
      };
      this.disposeTask = new ExpirableTask(TIMEOUT_FOR_DISPOSE);
      this.send({ kind: WorkerMessageKind.Dispose });
      return this.disposeTask.promise
        .then(killWorker)
        .catch(killWorker);
    }
  }

  private logUnidentifiedMessage(message: never) {
    this.log.error(`Received unidentified message ${message}`);
  }
}