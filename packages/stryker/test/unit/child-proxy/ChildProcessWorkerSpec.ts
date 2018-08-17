import * as path from 'path';
import ChildProcessProxyWorker from '../../../src/child-proxy/ChildProcessProxyWorker';
import { expect } from 'chai';
import { serialize } from '../../../src/utils/objectUtils';
import { WorkerMessage, WorkerMessageKind, ParentMessage, WorkResult, CallMessage, ParentMessageKind, InitMessage } from '../../../src/child-proxy/messageProtocol';
import PluginLoader, * as pluginLoader from '../../../src/PluginLoader';
import { Mock, mock } from '../../helpers/producers';
import HelloClass from './HelloClass';
import LogConfigurator from '../../../src/logging/LogConfigurator';
import { LogLevel } from 'stryker-api/core';
import LoggingClientContext from '../../../src/logging/LoggingClientContext';
import { Logger } from 'stryker-api/logging';
import currentLogMock from '../../helpers/logMock';

const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({ port: 4200, level: LogLevel.Fatal });

describe('ChildProcessProxyWorker', () => {

  let processOnStub: sinon.SinonStub;
  let processSendStub: sinon.SinonStub;
  let processListenersStub: sinon.SinonStub;
  let configureChildProcessStub: sinon.SinonStub;
  let processRemoveListenerStub: sinon.SinonStub;
  let processChdirStub: sinon.SinonStub;
  let logMock: Mock<Logger>;
  let pluginLoaderMock: Mock<PluginLoader>;
  let originalProcessSend: undefined | NodeJS.MessageListener;
  let processes: NodeJS.MessageListener[];
  const workingDir = 'working dir';

  beforeEach(() => {
    processes = [];
    logMock = currentLogMock();
    processOnStub = sandbox.stub(process, 'on');
    processListenersStub = sandbox.stub(process, 'listeners');
    processListenersStub.returns(processes);
    processRemoveListenerStub = sandbox.stub(process, 'removeListener');
    processSendStub = sandbox.stub();
    // process.send is normally undefined
    originalProcessSend = process.send;
    process.send = processSendStub;
    processChdirStub = sandbox.stub(process, 'chdir');
    configureChildProcessStub = sandbox.stub(LogConfigurator, 'configureChildProcess');
    pluginLoaderMock = mock(PluginLoader);
    sandbox.stub(pluginLoader, 'default').returns(pluginLoaderMock);
  });

  afterEach(() => {
    process.send = originalProcessSend;
  });

  it('should listen to parent process', () => {
    new ChildProcessProxyWorker();
    expect(processOnStub).calledWith('message');
  });

  describe('after init message', () => {

    let sut: ChildProcessProxyWorker;
    let initMessage: InitMessage;

    beforeEach(() => {
      sut = new ChildProcessProxyWorker();
      initMessage = {
        kind: WorkerMessageKind.Init,
        loggingContext: LOGGING_CONTEXT,
        constructorArgs: ['FooBarName'],
        plugins: ['fooPlugin', 'barPlugin'],
        requirePath: require.resolve('./HelloClass'),
        workingDirectory: workingDir
      };
    });

    it('should create the correct real instance', () => {
      processOnMessage(initMessage);
      expect(sut.realSubject).instanceOf(HelloClass);
      const actual = sut.realSubject as HelloClass;
      expect(actual.name).eq('FooBarName');
    });

    it('should change the current working directory', () => {
      processOnMessage(initMessage);
      const fullWorkingDir = path.resolve(workingDir);
      expect(logMock.debug).calledWith(`Changing current working directory for this process to ${fullWorkingDir}`);
      expect(processChdirStub).calledWith(fullWorkingDir);
    });

    it('should not change the current working directory if it didn\'t change', () => {
      initMessage.workingDirectory = process.cwd();
      processOnMessage(initMessage);
      expect(logMock.debug).not.called;
      expect(processChdirStub).not.called;
    });

    it('should send "init_done"', async () => {
      processOnMessage(initMessage);
      const expectedWorkerResponse: ParentMessage = { kind: ParentMessageKind.Initialized };
      await tick(); // make sure promise is resolved
      expect(processSendStub).calledWith(serialize(expectedWorkerResponse));
    });

    it('should remove any additional listeners', async () => {
      // Arrange
      function noop() { }
      processes.push(noop);

      // Act
      processOnMessage(initMessage);
      await tick(); // make sure promise is resolved

      // Assert
      expect(processRemoveListenerStub).calledWith('message', noop);
    });

    it('should set global log level', () => {
      processOnStub.callArgWith(1, serialize(initMessage));
      expect(configureChildProcessStub).calledWith(LOGGING_CONTEXT);
    });

    it('should load plugins', () => {
      processOnMessage(initMessage);
      expect(pluginLoader.default).calledWithNew;
      expect(pluginLoader.default).calledWith(['fooPlugin', 'barPlugin']);
      expect(pluginLoaderMock.load).called;
    });
    
    it('should handle unhandledRejection events', () => {
      processOnMessage(initMessage);
      const error = new Error('foobar');
      processOnStub.withArgs('unhandledRejection').callArgWith(1, error);
      expect(logMock.debug).calledWith(`UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): ${error}`);
    });
    
    it('should handle rejectionHandled events', () => {
      processOnMessage(initMessage);
      processOnStub.withArgs('rejectionHandled').callArgWith(1);
      expect(logMock.debug).calledWith('PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 0)');
    });

    describe('on worker message', () => {

      async function actAndAssert(workerMessage: CallMessage, expectedResult: WorkResult) {
        // Act
        processOnMessage(initMessage);
        processOnMessage(workerMessage);
        await tick();
        // Assert
        expect(processSendStub).calledWith(serialize(expectedResult));
      }

      async function actAndAssertRejection(workerMessage: CallMessage, expectedError: string) {
        // Act
        processOnMessage(initMessage);
        processOnMessage(workerMessage);
        await tick();
        // Assert
        expect(processSendStub).calledWithMatch(`"correlationId": ${workerMessage.correlationId.toString()}`);
        expect(processSendStub).calledWithMatch(`"kind": ${ParentMessageKind.Rejection.toString()}`);
        expect(processSendStub).calledWithMatch(`"error": "Error: ${expectedError}`);
      }

      it('should send the result', async () => {
        // Arrange
        const workerMessage: WorkerMessage = {
          kind: WorkerMessageKind.Call,
          correlationId: 32,
          args: [],
          methodName: 'sayHello'
        };
        const expectedResult: WorkResult = {
          kind: ParentMessageKind.Result,
          correlationId: 32,
          result: 'hello from FooBarName'
        };

        await actAndAssert(workerMessage, expectedResult);
      });

      it('should send a rejection', async () => {
        // Arrange
        const workerMessage: WorkerMessage = {
          kind: WorkerMessageKind.Call,
          correlationId: 32,
          args: [],
          methodName: 'reject'
        };
        await actAndAssertRejection(workerMessage, 'Rejected');
      });

      it('should send a thrown synchronous error as rejection', async () => {
        // Arrange
        const workerMessage: WorkerMessage = {
          kind: WorkerMessageKind.Call,
          correlationId: 32,
          args: ['foo bar'],
          methodName: 'throw'
        };
        await actAndAssertRejection(workerMessage, 'foo bar');
      });

      it('should use correct arguments', async () => {
        // Arrange
        const workerMessage: WorkerMessage = {
          kind: WorkerMessageKind.Call,
          correlationId: 32,
          args: ['foo', 'bar', 'chair'],
          methodName: 'say'
        };
        const expectedResult: WorkResult = {
          kind: ParentMessageKind.Result,
          correlationId: 32,
          result: 'hello foo and bar and chair'
        };

        await actAndAssert(workerMessage, expectedResult);
      });

      it('should work with promises from real class', async () => {
        // Arrange
        const workerMessage: WorkerMessage = {
          kind: WorkerMessageKind.Call,
          correlationId: 32,
          args: [],
          methodName: 'sayDelayed'
        };
        const expectedResult: WorkResult = {
          kind: ParentMessageKind.Result,
          correlationId: 32,
          result: 'delayed hello from FooBarName'
        };

        await actAndAssert(workerMessage, expectedResult);
      });

    });
  });

  function processOnMessage(message: WorkerMessage) {
    processOnStub
      .withArgs('message')
      .callArgWith(1, [serialize(message)]);
  }
  
});


function tick() {
  return new Promise(res => setTimeout(res, 0));
}