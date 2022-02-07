import path from 'path';
import { fileURLToPath, URL } from 'url';

import { LogLevel } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { Task } from '@stryker-mutator/util';
import type { createInjector, Injector } from 'typed-inject';

import { ChildProcessContext, ChildProcessProxyWorker } from '../../../src/child-proxy/child-process-proxy-worker.js';
import {
  CallMessage,
  InitMessage,
  ParentMessage,
  ParentMessageKind,
  WorkerMessage,
  WorkerMessageKind,
  WorkResult,
} from '../../../src/child-proxy/message-protocol.js';
import { LogConfigurator, LoggingClientContext } from '../../../src/logging/index.js';
import { serialize } from '../../../src/utils/string-utils.js';
import { currentLogMock } from '../../helpers/log-mock.js';
import { Mock } from '../../helpers/producers.js';
import { coreTokens, PluginLoader } from '../../../src/di/index.js';

import { HelloClass } from './hello-class.js';

const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({ port: 4200, level: LogLevel.Fatal });

interface PrivateContext extends ChildProcessContext {
  [coreTokens.pluginLoader]: PluginLoader;
}

describe(ChildProcessProxyWorker.name, () => {
  let processOnStub: sinon.SinonStub;
  let processSendStub: sinon.SinonStub;
  let processListenersStub: sinon.SinonStub;
  let configureChildProcessStub: sinon.SinonStub;
  let processRemoveListenerStub: sinon.SinonStub;
  let injectorMock: sinon.SinonStubbedInstance<Injector<PrivateContext>>;
  let pluginLoaderMock: sinon.SinonStubbedInstance<PluginLoader>;
  let processChdirStub: sinon.SinonStub;
  let createInjectorStub: sinon.SinonStubbedMember<typeof createInjector>;
  let logMock: Mock<Logger>;
  let originalProcessSend: typeof process.send;
  let processes: NodeJS.MessageListener[];
  let pluginModulePaths: string[];
  const workingDir = 'working dir';

  beforeEach(() => {
    injectorMock = factory.injector();
    createInjectorStub = sinon.stub();
    createInjectorStub.returns(injectorMock);
    pluginLoaderMock = sinon.createStubInstance(PluginLoader);
    injectorMock.resolve.withArgs(coreTokens.pluginLoader).returns(pluginLoaderMock);
    processes = [];
    logMock = currentLogMock();
    processOnStub = sinon.stub(process, 'on');
    processListenersStub = sinon.stub(process, 'listeners');
    processListenersStub.returns(processes);
    processRemoveListenerStub = sinon.stub(process, 'removeListener');
    processSendStub = sinon.stub();
    pluginModulePaths = ['plugin', 'paths'];
    // process.send is normally undefined
    originalProcessSend = process.send;
    process.send = processSendStub;
    processChdirStub = sinon.stub(process, 'chdir');
    configureChildProcessStub = sinon.stub(LogConfigurator, 'configureChildProcess');
  });

  afterEach(() => {
    process.send = originalProcessSend;
  });

  it('should listen to parent process', () => {
    new ChildProcessProxyWorker(createInjectorStub);
    expect(processOnStub).calledWith('message');
  });

  describe('after init message', () => {
    let sut: ChildProcessProxyWorker;
    let initMessage: InitMessage;

    beforeEach(() => {
      sut = new ChildProcessProxyWorker(createInjectorStub);
      const options = factory.strykerOptions({ testRunner: 'fooBar' });
      initMessage = {
        kind: WorkerMessageKind.Init,
        loggingContext: LOGGING_CONTEXT,
        options,
        pluginModulePaths,
        namedExport: HelloClass.name,
        modulePath: fileURLToPath(new URL('./hello-class.js', import.meta.url)),
        workingDirectory: workingDir,
      };
    });

    it('should create the correct real instance', async () => {
      await processOnMessage(initMessage);
      expect(sut.realSubject).instanceOf(HelloClass);
      const actual = sut.realSubject as HelloClass;
      expect(actual.options.testRunner).eq('fooBar');
    });

    it('should change the current working directory', async () => {
      await processOnMessage(initMessage);
      const fullWorkingDir = path.resolve(workingDir);
      expect(logMock.debug).calledWith(`Changing current working directory for this process to ${fullWorkingDir}`);
      expect(processChdirStub).calledWith(fullWorkingDir);
    });

    it("should not change the current working directory if it didn't change", async () => {
      initMessage.workingDirectory = process.cwd();
      await processOnMessage(initMessage);
      expect(logMock.debug).not.called;
      expect(processChdirStub).not.called;
    });

    it('should send "init_done"', async () => {
      await processOnMessage(initMessage);
      const expectedWorkerResponse: ParentMessage = { kind: ParentMessageKind.Initialized };
      expect(processSendStub).calledWith(serialize(expectedWorkerResponse));
    });

    it('should remove any additional listeners', async () => {
      // Arrange
      function noop() {
        //noop
      }
      processes.push(noop);

      // Act
      await processOnMessage(initMessage);
      await tick(); // make sure promise is resolved

      // Assert
      expect(processRemoveListenerStub).calledWith('message', noop);
    });

    it('should set global log level', () => {
      processOnStub.callArgWith(1, serialize(initMessage));
      expect(configureChildProcessStub).calledWith(LOGGING_CONTEXT);
    });

    it('should handle unhandledRejection events', async () => {
      await processOnMessage(initMessage);
      const error = new Error('foobar');
      processOnStub.withArgs('unhandledRejection').callArgWith(1, error);
      expect(logMock.debug).calledWith(`UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): ${error}`);
    });

    it('should handle rejectionHandled events', async () => {
      await processOnMessage(initMessage);
      processOnStub.withArgs('rejectionHandled').callArgWith(1);
      expect(logMock.debug).calledWith('PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 0)');
    });

    describe('on worker message', () => {
      async function actAndAssert(workerMessage: CallMessage, expectedResult: WorkResult) {
        // Act
        await processOnMessage(initMessage);

        await processOnMessage(workerMessage);
        // Assert
        expect(processSendStub).calledWith(serialize(expectedResult));
      }

      async function actAndAssertRejection(workerMessage: CallMessage, expectedError: string) {
        // Act
        await processOnMessage(initMessage);

        await processOnMessage(workerMessage);
        // Assert
        expect(processSendStub).calledWithMatch(`"correlationId":${workerMessage.correlationId.toString()}`);
        expect(processSendStub).calledWithMatch(`"kind":${ParentMessageKind.Rejection.toString()}`);
        expect(processSendStub).calledWithMatch(`"error":"Error: ${expectedError}`);
      }

      it('should send the result', async () => {
        // Arrange
        const workerMessage: WorkerMessage = {
          args: [],
          correlationId: 32,
          kind: WorkerMessageKind.Call,
          methodName: 'sayHello',
        };
        const expectedResult: WorkResult = {
          correlationId: 32,
          kind: ParentMessageKind.Result,
          result: 'hello from FooBarName',
        };

        await actAndAssert(workerMessage, expectedResult);
      });

      it('should send a rejection', async () => {
        // Arrange
        const workerMessage: WorkerMessage = {
          args: [],
          correlationId: 32,
          kind: WorkerMessageKind.Call,
          methodName: 'reject',
        };
        await actAndAssertRejection(workerMessage, 'Rejected');
      });

      it('should send a thrown synchronous error as rejection', async () => {
        // Arrange
        const workerMessage: WorkerMessage = {
          args: ['foo bar'],
          correlationId: 32,
          kind: WorkerMessageKind.Call,
          methodName: 'throw',
        };
        await actAndAssertRejection(workerMessage, 'foo bar');
      });

      it('should use correct arguments', async () => {
        // Arrange
        const workerMessage: WorkerMessage = {
          args: ['foo', 'bar', 'chair'],
          correlationId: 32,
          kind: WorkerMessageKind.Call,
          methodName: 'say',
        };
        const expectedResult: WorkResult = {
          correlationId: 32,
          kind: ParentMessageKind.Result,
          result: 'hello foo and bar and chair',
        };

        await actAndAssert(workerMessage, expectedResult);
      });

      it('should work with promises from real class', async () => {
        // Arrange
        const workerMessage: WorkerMessage = {
          args: [],
          correlationId: 32,
          kind: WorkerMessageKind.Call,
          methodName: 'sayDelayed',
        };
        const expectedResult: WorkResult = {
          correlationId: 32,
          kind: ParentMessageKind.Result,
          result: 'delayed hello from FooBarName',
        };

        await actAndAssert(workerMessage, expectedResult);
      });
    });
  });

  function processOnMessage(message: WorkerMessage) {
    const task = new Task();
    processSendStub.callsFake(task.resolve);
    processOnStub.withArgs('message').callArgWith(1, [serialize(message)]);
    return task.promise;
  }
});

function tick() {
  return new Promise((res) => setTimeout(res, 0));
}
