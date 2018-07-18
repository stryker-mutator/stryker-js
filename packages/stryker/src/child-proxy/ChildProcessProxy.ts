import { fork, ChildProcess } from 'child_process';
import { File } from 'stryker-api/core';
import { getLogger } from 'stryker-api/logging';
import { WorkerMessage, WorkerMessageKind, ParentMessage, autoStart, ParentMessageKind } from './messageProtocol';
import { serialize, deserialize } from '../utils/objectUtils';
import Task from '../utils/Task';
import LoggingClientContext from '../logging/LoggingClientContext';

type MethodPromised = { (...args: any[]): Promise<any> };

export type Promisified<T> = {
  [K in keyof T]: T[K] extends MethodPromised ? T[K] : T[K] extends Function ? MethodPromised : () => Promise<T[K]>;
};




// Missing features:
// 1. CWD    this.log.debug(`Changing current working directory for this process to ${message.runnerOptions.sandboxWorkingFolder}`);
// 2. Error handling

export default class ChildProcessProxy<T> {
  readonly proxy: Promisified<T> = {} as Promisified<T>;

  private worker: ChildProcess;
  private initTask: Task;
  private disposeTask: Task<void>;
  private workerTasks: Task<any>[] = [];
  private log = getLogger(ChildProcessProxy.name);

  private constructor(requirePath: string, loggingContext: LoggingClientContext, plugins: string[], private constructorFunction: { new(...params: any[]): T }, constructorParams: any[]) {
    this.worker = fork(require.resolve('./ChildProcessProxyWorker'), [autoStart], { silent: false, execArgv: [] });
    this.initTask = new Task();
    this.send({
      kind: WorkerMessageKind.Init,
      loggingContext,
      plugins,
      requirePath,
      constructorArgs: constructorParams
    });
    this.listenToWorkerMessages();
    this.initProxy();
  }

  /**
  * Creates a proxy where each function of the object created using the constructorFunction arg is ran inside of a child process
  */
  static create<T, P1>(requirePath: string, loggingContext: LoggingClientContext, plugins: string[], constructorFunction: { new(arg: P1): T }, arg: P1): ChildProcessProxy<T>;
  /**
  * Creates a proxy where each function of the object created using the constructorFunction arg is ran inside of a child process
  */
  static create<T, P1, P2>(requirePath: string, loggingContext: LoggingClientContext, plugins: string[], constructorFunction: { new(arg: P1, arg2: P2): T }, arg1: P1, arg2: P2): ChildProcessProxy<T>;
  /**
  * Creates a proxy where each function of the object created using the constructorFunction arg is ran inside of a child process
  */
  static create<T>(requirePath: string, loggingContext: LoggingClientContext, plugins: string[], constructorFunction: { new(...params: any[]): T }, ...constructorArgs: any[]) {
    return new ChildProcessProxy(requirePath, loggingContext, plugins, constructorFunction, constructorArgs);
  }

  private send(message: WorkerMessage) {
    this.worker.send(serialize(message));
  }

  private initProxy() {
    Object.keys(this.constructorFunction.prototype).forEach(methodName => {
      this.proxyMethod(methodName);
    });
  }

  private proxyMethod(methodName: string) {
    this.proxy[methodName as keyof T] = ((...args: any[]) => {
      const workerTask = new Task<any>();
      this.initTask.promise.then(() => {
        const correlationId = this.workerTasks.push(workerTask) - 1;
        this.send({
          kind: WorkerMessageKind.Call,
          correlationId,
          methodName,
          args
        });
      });
      return workerTask.promise;
    }) as any;
  }

  private listenToWorkerMessages() {
    this.worker.on('message', (serializedMessage: string) => {
      const message: ParentMessage = deserialize(serializedMessage, [File]);
      switch (message.kind) {
        case ParentMessageKind.Initialized:
          this.initTask.resolve(undefined);
          break;
        case ParentMessageKind.Result:
          this.workerTasks[message.correlationId].resolve(message.result);
          break;
        case ParentMessageKind.Rejection:
          this.workerTasks[message.correlationId].reject(new Error(message.error));
          break;
        case ParentMessageKind.DisposeCompleted:
          this.disposeTask.resolve(undefined);
          break;
        default:
          this.logUnidentifiedMessage(message);
          break;
      }
    });
  }

  public dispose(): Promise<void> {
    this.disposeTask = new Task();
    this.send({ kind: WorkerMessageKind.Dispose });
    return this.disposeTask.promise
      .then(() => this.worker.kill())
      .catch(() => this.worker.kill());
  }

  private logUnidentifiedMessage(message: never) {
    this.log.error(`Received unidentified message ${message}`);
  }
}