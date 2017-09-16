import { fork, ChildProcess } from 'child_process';
import { WorkerMessage, WorkerMessageKind, ParentMessage, autoStart } from './messageProtocol';
import { serialize, deserialize } from '../utils/objectUtils';
import Task from '../utils/Task';

export type ChildProxy<T> = {
  [K in keyof T]: (...args: any[]) => Promise<any>;
};

export default class ChildProcessProxy<T> {
  readonly proxy: ChildProxy<T> = {} as ChildProxy<T>;

  private worker: ChildProcess;
  private initTask: Task;
  private workerTasks: Task<any>[] = [];

  private constructor(requirePath: string, logLevel: string, plugins: string[], private constructorFunction: { new(...params: any[]): T }, constructorParams: any[]) {
    this.worker = fork(require.resolve('./ChildProcessProxyWorker'), [autoStart], { silent: false, execArgv: [] });
    this.initTask = new Task();
    this.send({
      kind: WorkerMessageKind.Init,
      logLevel,
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
  static create<T, P1>(requirePath: string, logLevel: string, plugins: string[], constructorFunction: { new(arg: P1): T }, arg: P1): ChildProcessProxy<T>;
  /**
  * Creates a proxy where each function of the object created using the constructorFunction arg is ran inside of a child process
  */
  static create<T, P1, P2>(requirePath: string, logLevel: string, plugins: string[], constructorFunction: { new(arg: P1, arg2: P2): T }, arg1: P1, arg2: P2): ChildProcessProxy<T>;
  /**
  * Creates a proxy where each function of the object created using the constructorFunction arg is ran inside of a child process
  */
  static create<T>(requirePath: string, logLevel: string, plugins: string[], constructorFunction: { new(...params: any[]): T }, ...constructorArgs: any[]) {
    return new ChildProcessProxy(requirePath, logLevel, plugins, constructorFunction, constructorArgs);
  }

  private send(message: WorkerMessage) {
    this.worker.send(serialize(message));
  }

  private initProxy() {
    Object.keys(this.constructorFunction.prototype).forEach((methodName: keyof T) => {
      this.proxyMethod(methodName);
    });
  }

  private proxyMethod(methodName: keyof T) {
    this.proxy[methodName] = (...args: any[]) => {
      const workerTask = new Task<any>();
      this.initTask.promise.then(() => {
        const correlationId = this.workerTasks.push(workerTask) - 1;
        this.send({
          kind: WorkerMessageKind.Work,
          correlationId,
          methodName,
          args
        });
      });
      return workerTask.promise;
    };
  }

  private listenToWorkerMessages() {
    this.worker.on('message', (serializedMessage: string) => {
      const message: ParentMessage = deserialize(serializedMessage);
      if (message === 'init_done') {
        this.initTask.resolve(undefined);
      } else {
        this.workerTasks[message.correlationId].resolve(message.result);
      }
    });
  }

  public dispose() {
    this.worker.kill();
  }
}