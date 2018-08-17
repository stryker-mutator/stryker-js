import * as path from 'path';
import { getLogger, Logger } from 'stryker-api/logging';
import { File } from 'stryker-api/core';
import { serialize, deserialize, errorToString } from '../utils/objectUtils';
import { WorkerMessage, WorkerMessageKind, ParentMessage, autoStart, ParentMessageKind, CallMessage } from './messageProtocol';
import PluginLoader from '../PluginLoader';
import LogConfigurator from '../logging/LogConfigurator';

export default class ChildProcessProxyWorker {

  private log: Logger;

  realSubject: any;

  constructor() {
    // Make sure to bind the methods in order to ensure the `this` pointer
    this.handleMessage = this.handleMessage.bind(this);
    process.on('message', this.handleMessage);
  }

  private send(value: ParentMessage) {
    if (process.send) {
      process.send(serialize(value));
    }
  }

  private handleMessage(serializedMessage: string) {
    const message = deserialize<WorkerMessage>(serializedMessage, [File]);
    switch (message.kind) {
      case WorkerMessageKind.Init:
        LogConfigurator.configureChildProcess(message.loggingContext);
        this.log = getLogger(ChildProcessProxyWorker.name);
        this.handlePromiseRejections();
        new PluginLoader(message.plugins).load();
        const RealSubjectClass = require(message.requirePath).default;
        const workingDir = path.resolve(message.workingDirectory);
        if (process.cwd() !== workingDir) {
          this.log.debug(`Changing current working directory for this process to ${workingDir}`);
          process.chdir(workingDir);
        }
        this.realSubject = new RealSubjectClass(...message.constructorArgs);
        this.send({ kind: ParentMessageKind.Initialized });
        this.removeAnyAdditionalMessageListeners(this.handleMessage);
        break;
      case WorkerMessageKind.Call:
        new Promise(resolve => resolve(this.doCall(message)))
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
        this.removeAnyAdditionalMessageListeners(this.handleMessage);
        break;
      case WorkerMessageKind.Dispose:
        const sendCompleted = () => {
          this.send({ kind: ParentMessageKind.DisposeCompleted });
        };
        LogConfigurator.shutdown()
          .then(sendCompleted)
          .catch(sendCompleted);
        break;
    }
  }

  private doCall(message: CallMessage): {} | PromiseLike<{}> | undefined {
    if (typeof this.realSubject[message.methodName] === 'function') {
      return this.realSubject[message.methodName](...message.args);
    } else {
      return this.realSubject[message.methodName];
    }
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

  /**
   * During mutation testing, it's to be expected that promise rejections are not handled synchronously anymore (or not at all)
   * Let's handle those events so future versions of node don't crash
   * See issue 350: https://github.com/stryker-mutator/stryker/issues/350
   */
  private handlePromiseRejections() {
    const unhandledRejections: Promise<any>[] = [];
    process.on('unhandledRejection', (reason, promise) => {
      const unhandledPromiseId = unhandledRejections.push(promise);
      this.log.debug(`UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: ${unhandledPromiseId}): ${reason}`);
    });
    process.on('rejectionHandled', (promise) => {
      const unhandledPromiseId = unhandledRejections.indexOf(promise) + 1;
      this.log.debug(`PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: ${unhandledPromiseId})`);
    });
  }
}

// Prevent side effects for merely requiring the file
// Only actually start the child worker when it is requested
if (process.argv.indexOf(autoStart) !== -1) {
  new ChildProcessProxyWorker();
}
