import { expect } from 'chai';
import * as childProcess from 'child_process';
import ChildProcessProxy from '../../../src/child-proxy/ChildProcessProxy';
import { autoStart, InitMessage, WorkerMessageKind, ParentMessage, WorkerMessage, ParentMessageKind } from '../../../src/child-proxy/messageProtocol';
import { serialize } from '../../../src/utils/objectUtils';
import HelloClass from './HelloClass';


describe('ChildProcessProxy', () => {

  let sut: ChildProcessProxy<HelloClass>;
  let forkStub: sinon.SinonStub;
  let childProcessMock: {
    send: sinon.SinonStub;
    on: sinon.SinonStub;
  };

  beforeEach(() => {
    forkStub = sandbox.stub(childProcess, 'fork');
    childProcessMock = {
      send: sandbox.stub(),
      on: sandbox.stub()
    };
    forkStub.returns(childProcessMock);
  });

  describe('create', () => {

    it('should create child process', () => {
      ChildProcessProxy.create('foobar', 'FATAL', ['examplePlugin', 'secondExamplePlugin'], HelloClass, 'something');
      expect(forkStub).calledWith(require.resolve('../../../src/child-proxy/ChildProcessProxyWorker'), [autoStart], { silent: false, execArgv: [] });
    });

    it('should send init message to child process', () => {
      const expectedMessage: InitMessage = {
        kind: WorkerMessageKind.Init,
        logLevel: 'FATAL ;)',
        plugins: ['examplePlugin', 'secondExamplePlugin'],
        requirePath: 'foobar',
        constructorArgs: ['something']
      };

      // Act
      ChildProcessProxy.create('foobar', 'FATAL ;)', ['examplePlugin', 'secondExamplePlugin'], HelloClass, 'something');

      // Assert
      expect(childProcessMock.send).calledWith(serialize(expectedMessage));
    });

    it('should listen to worker process', () => {
      ChildProcessProxy.create('foobar', '', [], HelloClass, '');
      expect(childProcessMock.on).calledWith('message');
    });
  });

  describe('when calling methods', () => {

    beforeEach(() => {
      sut = ChildProcessProxy.create('', '', [], HelloClass, '');
      const initDoneResult: ParentMessage = { kind: ParentMessageKind.Initialized };
      const msg = serialize(initDoneResult);
      childProcessMock.on.callArgWith(1, [msg]);
    });

    it('should proxy the message', async () => {
      // Arrange
      const workerResponse: ParentMessage = {
        kind: ParentMessageKind.Result,
        correlationId: 0,
        result: 'ack'
      };
      const expectedWorkerMessage: WorkerMessage = {
        kind: WorkerMessageKind.Work,
        correlationId: 0,
        methodName: 'sayHello',
        args: ['echo']
      };

      // Act
      const delayedEcho = sut.proxy.sayHello('echo');
      await tick();
      childProcessMock.on.callArgWith(1, [serialize(workerResponse)]); // resolve the promise
      const result: string = await delayedEcho;

      // Assert
      expect(result).eq('ack');
      expect(childProcessMock.send).calledWith(serialize(expectedWorkerMessage));
    });

  });

  function tick() {
    return new Promise(res => setTimeout(res, 0));
  }
});