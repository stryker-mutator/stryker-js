import { serialize, deserialize } from '../utils/objectUtils';
import { WorkerMessage, WorkerMessageKind, ParentMessage, autoStart } from './messageProtocol';
import { setGlobalLogLevel, getLogger } from 'log4js';
import PluginLoader from '../PluginLoader';

export default class ChildProcessProxyWorker {

  private log = getLogger(ChildProcessProxyWorker.name);

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

    const handler = (serializedMessage: string) => {
      const message = deserialize(serializedMessage) as WorkerMessage;
      switch (message.kind) {
        case WorkerMessageKind.Init:
          setGlobalLogLevel(message.logLevel);
          new PluginLoader(message.plugins).load();
          const RealSubjectClass = require(message.requirePath).default;
          this.realSubject = new RealSubjectClass(...message.constructorArgs);
          this.send('init_done');
          this.removeAnyAdditionalMessageListeners(handler);
          break;
        case WorkerMessageKind.Work:
          const result = this.realSubject[message.methodName](...message.args);
          Promise.resolve(result).then(result => {
            this.send({
              correlationId: message.correlationId,
              result
            });
          });
          this.removeAnyAdditionalMessageListeners(handler);
          break;
      }
    };
    process.on('message', handler);
  }

  /**
   * Remove any addition message listeners that might me eavesdropping.
   * the @ngtools/webpack plugin listens to messages and throws an error whenever it could not handle a message
   * @see https://github.com/angular/angular-cli/blob/f776d3cf7982b64734c57fe4407434e9f4ec09f7/packages/%40ngtools/webpack/src/type_checker.ts#L79
   * @param exceptListener The listener that should remain
   */
  private removeAnyAdditionalMessageListeners(exceptListener: NodeJS.MessageListener) {
    process.listeners('message').forEach(listener => {
      if (listener !== exceptListener) {
        this.log.debug('Removing an additional message listener, we don\'t want eavesdropping on our inter-process communication: %s', listener.toString());
        process.removeListener('message', listener);
      }
    });
  }
}

// Prevent side effects for merely requiring the file
// Only actually start the child worker when it is requested
if (process.argv.indexOf(autoStart) !== -1) {
  new ChildProcessProxyWorker();
}
