import path from 'path';

import { File } from '@stryker-mutator/api/core';
import { errorToString } from '@stryker-mutator/util';
import { getLogger, Logger } from 'log4js';

import { buildChildProcessInjector } from '../di';
import { LogConfigurator } from '../logging';
import { deserialize, serialize } from '../utils/object-utils';

import { autoStart, CallMessage, ParentMessage, ParentMessageKind, WorkerMessage, WorkerMessageKind, InitMessage } from './message-protocol';

export class ChildProcessProxyWorker {
  private log?: Logger;

  public realSubject: any;

  constructor() {
    // Make sure to bind the methods in order to ensure the `this` pointer
    this.handleMessage = this.handleMessage.bind(this);
    process.on('message', this.handleMessage);
  }

  private send(value: ParentMessage) {
    if (process.send) {
      const str = serialize(value, [File]);
      process.send(str);
    }
  }
  private handleMessage(serializedMessage: string) {
    const message = deserialize<WorkerMessage>(serializedMessage, [File]);
    switch (message.kind) {
      case WorkerMessageKind.Init:
        this.handleInit(message);
        this.removeAnyAdditionalMessageListeners(this.handleMessage);
        break;
      case WorkerMessageKind.Call:
        this.handleCall(message);
        this.removeAnyAdditionalMessageListeners(this.handleMessage);
        break;
      case WorkerMessageKind.Dispose:
        const sendCompleted = () => {
          this.send({ kind: ParentMessageKind.DisposeCompleted });
        };
        LogConfigurator.shutdown().then(sendCompleted).catch(sendCompleted);
        break;
    }
  }

  private handleInit(message: InitMessage) {
    LogConfigurator.configureChildProcess(message.loggingContext);
    this.log = getLogger(ChildProcessProxyWorker.name);
    this.handlePromiseRejections();
    let injector = buildChildProcessInjector(message.options);
    const locals = message.additionalInjectableValues as Record<string, unknown>;
    for (const token in locals) {
      injector = injector.provideValue(token, locals[token]);
    }
    // we want it sync
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RealSubjectClass = require(message.requirePath)[message.requireName];
    const workingDir = path.resolve(message.workingDirectory);
    if (process.cwd() !== workingDir) {
      this.log.debug(`Changing current working directory for this process to ${workingDir}`);
      process.chdir(workingDir);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.realSubject = injector.injectClass(RealSubjectClass);
    this.send({ kind: ParentMessageKind.Initialized });
  }

  private async handleCall(message: CallMessage) {
    try {
      const result = await this.doCall(message);
      this.send({
        correlationId: message.correlationId,
        kind: ParentMessageKind.Result,
        result,
      });
    } catch (err) {
      this.send({
        correlationId: message.correlationId,
        error: errorToString(err),
        kind: ParentMessageKind.Rejection,
      });
    }
  }

  private doCall(message: CallMessage): PromiseLike<Record<string, unknown>> | Record<string, unknown> | undefined {
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
    process.listeners('message').forEach((listener) => {
      if (listener !== exceptListener) {
        this.log?.debug(
          "Removing an additional message listener, we don't want eavesdropping on our inter-process communication: %s",
          listener.toString()
        );
        process.removeListener('message', listener);
      }
    });
  }

  /**
   * During mutation testing, it's to be expected that promise rejections are not handled synchronously anymore (or not at all)
   * Let's handle those events so future versions of node don't crash
   * See issue 350: https://github.com/stryker-mutator/stryker-js/issues/350
   */
  private handlePromiseRejections() {
    const unhandledRejections: Array<Promise<unknown>> = [];
    process.on('unhandledRejection', (reason, promise) => {
      const unhandledPromiseId = unhandledRejections.push(promise);
      this.log?.debug(`UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: ${unhandledPromiseId}): ${reason}`);
    });
    process.on('rejectionHandled', (promise) => {
      const unhandledPromiseId = unhandledRejections.indexOf(promise) + 1;
      this.log?.debug(`PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: ${unhandledPromiseId})`);
    });
  }
}

// Prevent side effects for merely requiring the file
// Only actually start the child worker when it is requested
if (process.argv.includes(autoStart)) {
  new ChildProcessProxyWorker();
}
