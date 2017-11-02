import ChildProcessProxyWorker from '../../../src/child-proxy/ChildProcessProxyWorker';
import { expect } from 'chai';
import { serialize } from '../../../src/utils/objectUtils';
import { WorkerMessage, WorkerMessageKind, ParentMessage, WorkResult, WorkMessage } from '../../../src/child-proxy/messageProtocol';
import * as log4js from 'log4js';
import PluginLoader, * as pluginLoader from '../../../src/PluginLoader';
import { Mock, mock } from '../../helpers/producers';
import HelloClass from './HelloClass';

describe('ChildProcessProxyWorker', () => {

  let processOnStub: sinon.SinonStub;
  let processSendStub: sinon.SinonStub;
  let setGlobalLogLevelStub: sinon.SinonStub;
  let pluginLoaderMock: Mock<PluginLoader>;
  let originalProcessSend: undefined | ((message: any, sendHandle?: any) => void);

  beforeEach(() => {
    processOnStub = sandbox.stub(process, 'on');
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

    beforeEach(() => {
      sut = new ChildProcessProxyWorker();
      const initMessage: WorkerMessage = {
        kind: WorkerMessageKind.Init,
        logLevel: 'FooLevel',
        constructorArgs: ['FooBarName'],
        plugins: ['fooPlugin', 'barPlugin'],
        requirePath: require.resolve('./HelloClass')
      };
      processOnStub.callArgWith(1, [serialize(initMessage)]);
    });

    it('should create the correct real instance', () => {
      expect(sut.realSubject).instanceOf(HelloClass);
      const actual = sut.realSubject as HelloClass;
      expect(actual.name).eq('FooBarName');
    });

    it('should send "init_done"', async () => {
      const expectedWorkerResponse: ParentMessage = 'init_done';
      await tick(); // make sure promise is resolved
      expect(processSendStub).calledWith(serialize(expectedWorkerResponse));
    });

    it('should set global log level', () => {
      expect(setGlobalLogLevelStub).calledWith('FooLevel');
    });

    it('should load plugins', () => {
      expect(pluginLoader.default).calledWithNew;
      expect(pluginLoader.default).calledWith(['fooPlugin', 'barPlugin']);
      expect(pluginLoaderMock.load).called;
    });

    describe('on worker message', () => {

      async function actAndAssert(workerMessage: WorkMessage, expectedResult: WorkResult) {
        // Act
        processOnStub.callArgWith(1, serialize(workerMessage));
        await tick();
        // Assert
        expect(processSendStub).calledWith(serialize(expectedResult));
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
          correlationId: 32,
          result: 'hello from FooBarName'
        };

        await actAndAssert(workerMessage, expectedResult);
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