import ChildProcessProxyWorker from '../../../src/child-proxy/ChildProcessProxyWorker';
import { expect } from 'chai';
import { serialize } from '../../../src/utils/objectUtils';
import { WorkerMessage, WorkerMessageKind, ParentMessage, WorkResult, WorkMessage, ParentMessageKind } from '../../../src/child-proxy/messageProtocol';
import * as log4js from 'log4js';
import PluginLoader, * as pluginLoader from '../../../src/PluginLoader';
import { Mock, mock } from '../../helpers/producers';
import HelloClass from './HelloClass';

describe('ChildProcessProxyWorker', () => {

  let processOnStub: sinon.SinonStub;
  let processSendStub: sinon.SinonStub;
  let processListenersStub: sinon.SinonStub;
  let setGlobalLogLevelStub: sinon.SinonStub;
  let processRemoveListenerStub: sinon.SinonStub;
  let pluginLoaderMock: Mock<PluginLoader>;
  let originalProcessSend: undefined | NodeJS.MessageListener;
  let processes: NodeJS.MessageListener[];

  beforeEach(() => {
    processes = [];
    processOnStub = sandbox.stub(process, 'on');
    processListenersStub = sandbox.stub(process, 'listeners');
    processListenersStub.returns(processes);
    processRemoveListenerStub = sandbox.stub(process, 'removeListener');
    processSendStub = sandbox.stub();
    // process.send is normally undefined
    originalProcessSend = process.send;
    process.send = processSendStub;
    setGlobalLogLevelStub = sandbox.stub(log4js, 'setGlobalLogLevel');
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
    let initMessage: WorkerMessage;

    beforeEach(() => {
      sut = new ChildProcessProxyWorker();
      initMessage = {
        kind: WorkerMessageKind.Init,
        logLevel: 'FooLevel',
        constructorArgs: ['FooBarName'],
        plugins: ['fooPlugin', 'barPlugin'],
        requirePath: require.resolve('./HelloClass')
      };
    });

    it('should create the correct real instance', () => {
      processOnStub.callArgWith(1, [serialize(initMessage)]);
      expect(sut.realSubject).instanceOf(HelloClass);
      const actual = sut.realSubject as HelloClass;
      expect(actual.name).eq('FooBarName');
    });

    it('should send "init_done"', async () => {
      processOnStub.callArgWith(1, [serialize(initMessage)]);
      const expectedWorkerResponse: ParentMessage = { kind: ParentMessageKind.Initialized };
      await tick(); // make sure promise is resolved
      expect(processSendStub).calledWith(serialize(expectedWorkerResponse));
    });

    it('should remove any additional listeners', async () => {
      // Arrange
      function noop() { }
      processes.push(noop);

      // Act
      processOnStub.callArgWith(1, [serialize(initMessage)]);
      await tick(); // make sure promise is resolved

      // Assert
      expect(processRemoveListenerStub).calledWith('message', noop);
    });

    it('should set global log level', () => {
      processOnStub.callArgWith(1, serialize(initMessage));
      expect(setGlobalLogLevelStub).calledWith('FooLevel');
    });

    it('should load plugins', () => {
      processOnStub.callArgWith(1, serialize(initMessage));
      expect(pluginLoader.default).calledWithNew;
      expect(pluginLoader.default).calledWith(['fooPlugin', 'barPlugin']);
      expect(pluginLoaderMock.load).called;
    });

    describe('on worker message', () => {

      async function actAndAssert(workerMessage: WorkMessage, expectedResult: WorkResult) {
        // Act
        processOnStub.callArgWith(1, serialize(initMessage));
        processOnStub.callArgWith(1, serialize(workerMessage));
        await tick();
        // Assert
        expect(processSendStub).calledWith(serialize(expectedResult));
      }

      async function actAndAssertRejection(workerMessage: WorkMessage, expectedError: string) {
        // Act
        processOnStub.callArgWith(1, serialize(initMessage));
        processOnStub.callArgWith(1, serialize(workerMessage));
        await tick();
        // Assert
        expect(processSendStub).calledWithMatch(`"correlationId": ${workerMessage.correlationId.toString()}`);
        expect(processSendStub).calledWithMatch(`"kind": ${ParentMessageKind.Rejection.toString()}`);
        expect(processSendStub).calledWithMatch(`"error": "Error: ${expectedError}`);
      }

      it('should send the result', async () => {
        // Arrange
        const workerMessage: WorkerMessage = {
          kind: WorkerMessageKind.Work,
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
          kind: WorkerMessageKind.Work,
          correlationId: 32,
          args: [],
          methodName: 'reject'
        };
        await actAndAssertRejection(workerMessage, 'Rejected');
      });

      it('should send a thrown synchronous error as rejection', async () => { 
        // Arrange
        const workerMessage: WorkerMessage = {
          kind: WorkerMessageKind.Work,
          correlationId: 32,
          args: ['foo bar'],
          methodName: 'throw'
        };
        await actAndAssertRejection(workerMessage, 'foo bar');
      });

      it('should use correct arguments', async () => {
        // Arrange
        const workerMessage: WorkerMessage = {
          kind: WorkerMessageKind.Work,
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
          kind: WorkerMessageKind.Work,
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
});

function tick() {
  return new Promise(res => setTimeout(res, 0));
}