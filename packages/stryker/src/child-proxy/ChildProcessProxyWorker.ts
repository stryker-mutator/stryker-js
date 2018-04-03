import { setGlobalLogLevel, getLogger } from 'log4js';
import { File } from 'stryker-api/core';
import { serialize, deserialize, errorToString } from '../utils/objectUtils';
import { WorkerMessage, WorkerMessageKind, ParentMessage, autoStart, ParentMessageKind } from './messageProtocol';
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
      const message = deserialize<WorkerMessage>(serializedMessage, [File]);
      switch (message.kind) {
        case WorkerMessageKind.Init:
          setGlobalLogLevel(message.logLevel);
          new PluginLoader(message.plugins).load();
          const RealSubjectClass = require(message.requirePath).default;
          this.realSubject = new RealSubjectClass(...message.constructorArgs);
          this.send({ kind: ParentMessageKind.Initialized });
          this.removeAnyAdditionalMessageListeners(handler);
          break;
        case WorkerMessageKind.Work:
          new Promise(resolve => resolve(this.realSubject[message.methodName](...message.args)))
            .then(result => {
              this.send({
                kind: ParentMessageKind.Result,
                correlationId: message.correlationId,
                result
              });
            }).catch(error => {
              this.send({
                kind: ParentMessageKind.Rejection,
                error: errorToString(error),
                correlationId: message.correlationId
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
