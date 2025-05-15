import path from 'path';
import { URL } from 'url';

import { commonTokens, PluginKind, Plugin } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { errorToString, Task } from '@stryker-mutator/util';
import type { createInjector, Injector } from 'typed-inject';

import {
  ChildProcessContext,
  ChildProcessProxyWorker,
} from '../../../src/child-proxy/child-process-proxy-worker.js';
import {
  CallMessage,
  InitMessage,
  ParentMessage,
  ParentMessageKind,
  WorkerMessage,
  WorkerMessageKind,
  WorkResult,
} from '../../../src/child-proxy/message-protocol.js';
import { serialize } from '../../../src/utils/string-utils.js';
import {
  coreTokens,
  PluginLoader,
  LoadedPlugins,
} from '../../../src/di/index.js';
import { LoggingServerAddress } from '../../../src/logging/index.js';

import { HelloClass } from './hello-class.js';
import { LoggingClient } from '../../../src/logging/logging-client.js';
import { LogLevel } from '@stryker-mutator/api/core';

const LOGGING_ADDRESS: LoggingServerAddress = Object.freeze({ port: 4200 });

interface PrivateContext extends ChildProcessContext {
  [coreTokens.pluginsByKind]: PluginLoader;
  [coreTokens.loggingSink]: LoggingClient;
}

describe(ChildProcessProxyWorker.name, () => {
  let processOnStub: sinon.SinonStub;
  let processSendStub: sinon.SinonStub;
  let processListenersStub: sinon.SinonStub;
  let processRemoveListenerStub: sinon.SinonStub;
  let injectorMock: sinon.SinonStubbedInstance<Injector<PrivateContext>>;
  let pluginLoaderMock: sinon.SinonStubbedInstance<PluginLoader>;
  let processChdirStub: sinon.SinonStub;
  let createInjectorStub: sinon.SinonStubbedMember<typeof createInjector>;
  let originalProcessSend: typeof process.send;
  let processes: NodeJS.MessageListener[];
  let loadedPlugins: LoadedPlugins;
  let pluginModulePaths: string[];
  const workingDir = 'working dir';

  beforeEach(() => {
    injectorMock = factory.injector();
    createInjectorStub = sinon.stub();
    createInjectorStub.returns(injectorMock);
    injectorMock.resolve
      .withArgs(coreTokens.loggingSink)
      .returns(sinon.createStubInstance(LoggingClient));
    injectorMock.resolve
      .withArgs(commonTokens.getLogger)
      .returns(testInjector.getLogger);
    pluginLoaderMock = sinon.createStubInstance(PluginLoader);
    injectorMock.injectClass
      .withArgs(PluginLoader)
      .returns(pluginLoaderMock)
      .withArgs(HelloClass)
      .returns(new HelloClass(testInjector.options));
    processes = [];
    processOnStub = sinon.stub(process, 'on');
    processListenersStub = sinon.stub(process, 'listeners');
    processListenersStub.returns(processes);
    processRemoveListenerStub = sinon.stub(process, 'removeListener');
    processSendStub = sinon.stub();
    pluginModulePaths = ['plugin', 'paths'];
    loadedPlugins = {
      pluginModulePaths,
      pluginsByKind: new Map<PluginKind, Array<Plugin<PluginKind>>>([
        [
          PluginKind.Reporter,
          [
            {
              kind: PluginKind.Reporter,
              name: 'rep',
              factory: factory.reporter,
            },
          ],
        ],
      ]),
      schemaContributions: [],
    };
    pluginLoaderMock.load.resolves(loadedPlugins);
    // process.send is normally undefined
    originalProcessSend = process.send;
    process.send = processSendStub;
    processChdirStub = sinon.stub(process, 'chdir');
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

      const options = factory.strykerOptions({
        testRunner: 'fooBar',
        fileLogLevel: LogLevel.Error,
        logLevel: LogLevel.Information,
      });
      initMessage = {
        kind: WorkerMessageKind.Init,
        loggingServerAddress: LOGGING_ADDRESS,
        options,
        fileDescriptions: { 'foo.js': { mutate: true } },
        pluginModulePaths,
        namedExport: HelloClass.name,
        modulePath: new URL('./hello-class.js', import.meta.url).toString(),
        workingDirectory: workingDir,
      };
    });

    it('should create the correct real instance', async () => {
      await processOnMessage(initMessage);
      expect(sut.realSubject).instanceOf(HelloClass);
      sinon.assert.calledWithExactly(
        injectorMock.provideValue,
        commonTokens.options,
        initMessage.options,
      );
      sinon.assert.calledWithExactly(
        injectorMock.provideValue,
        coreTokens.pluginsByKind,
        loadedPlugins.pluginsByKind,
      );
    });

    it('should change the current working directory', async () => {
      await processOnMessage(initMessage);
      const fullWorkingDir = path.resolve(workingDir);
      expect(testInjector.logger.debug).calledWith(
        `Changing current working directory for this process to ${fullWorkingDir}`,
      );
      expect(processChdirStub).calledWith(fullWorkingDir);
    });

    it("should not change the current working directory if it didn't change", async () => {
      initMessage.workingDirectory = process.cwd();
      await processOnMessage(initMessage);
      expect(testInjector.logger.debug).not.called;
      expect(processChdirStub).not.called;
    });

    it('should send "init_done"', async () => {
      await processOnMessage(initMessage);
      const expectedWorkerResponse: ParentMessage = {
        kind: ParentMessageKind.Initialized,
      };
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
      sinon.assert.calledWithExactly(
        injectorMock.provideValue,
        coreTokens.loggerActiveLevel,
        LogLevel.Information,
      );
    });

    it('should handle unhandledRejection events', async () => {
      await processOnMessage(initMessage);
      const error = new Error('foobar');
      processOnStub.withArgs('unhandledRejection').callArgWith(1, error);
      expect(testInjector.logger.debug).calledWith(
        `UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): ${errorToString(error)}`,
      );
    });

    it('should handle rejectionHandled events', async () => {
      await processOnMessage(initMessage);
      processOnStub.withArgs('rejectionHandled').callArgWith(1);
      expect(testInjector.logger.debug).calledWith(
        'PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 0)',
      );
    });

    describe('on worker message', () => {
      async function actAndAssert(
        workerMessage: CallMessage,
        expectedResult: WorkResult,
      ) {
        // Act
        await processOnMessage(initMessage);

        await processOnMessage(workerMessage);
        // Assert
        expect(processSendStub).calledWith(serialize(expectedResult));
      }

      async function actAndAssertRejection(
        workerMessage: CallMessage,
        expectedError: string,
      ) {
        // Act
        await processOnMessage(initMessage);

        await processOnMessage(workerMessage);
        // Assert
        expect(processSendStub).calledWithMatch(
          `"correlationId":${workerMessage.correlationId.toString()}`,
        );
        expect(processSendStub).calledWithMatch(
          `"kind":${ParentMessageKind.CallRejection.toString()}`,
        );
        expect(processSendStub).calledWithMatch(
          `"error":"Error: ${expectedError}`,
        );
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
          kind: ParentMessageKind.CallResult,
          result: 'hello from HelloClass',
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
          kind: ParentMessageKind.CallResult,
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
          kind: ParentMessageKind.CallResult,
          result: 'delayed hello from HelloClass',
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
