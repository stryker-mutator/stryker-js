import { serialize, deserialize } from '../utils/objectUtils';
import { WorkerMessage, WorkerMessageKind, ParentMessage, autoStart } from './messageProtocol';
import { setGlobalLogLevel } from 'log4js';
import PluginLoader from '../PluginLoader';

export default class ChildProcessProxyWorker {
  realSubject: any;

  constructor() {
    this.listenToParent();
  }

  private send(value: ParentMessage) {
    if (process.send) {
      process.send(serialize(value));
    }
  }

  private listenToParent() {
    process.on('message', (serializedMessage: string) => {
      const message = deserialize(serializedMessage) as WorkerMessage;
      switch (message.kind) {
        case WorkerMessageKind.Init:
          setGlobalLogLevel(message.logLevel);
          new PluginLoader(message.plugins).load();
          const RealSubjectClass = require(message.requirePath).default;
          this.realSubject = new RealSubjectClass(...message.constructorArgs);
          this.send('init_done');
          break;
        case WorkerMessageKind.Work:
          const result = this.realSubject[message.methodName](...message.args);
          Promise.resolve(result).then(result => {
            this.send({
              correlationId: message.correlationId,
              result
            });
          });
      }
    });
  }
}
if (process.argv.indexOf(autoStart) !== -1) {
  new ChildProcessProxyWorker();
}
