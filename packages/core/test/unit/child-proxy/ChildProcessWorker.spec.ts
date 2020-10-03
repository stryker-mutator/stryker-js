import * as path from 'path';

import { LogLevel } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import ChildProcessProxyWorker from '../../../src/child-proxy/ChildProcessProxyWorker';
import {
  CallMessage,
  InitMessage,
  ParentMessage,
  ParentMessageKind,
  WorkerMessage,
  WorkerMessageKind,
  WorkResult,
} from '../../../src/child-proxy/messageProtocol';
import * as di from '../../../src/di';
import { LogConfigurator } from '../../../src/logging';
import { LoggingClientContext } from '../../../src/logging';
import currentLogMock from '../../helpers/logMock';
import { Mock } from '../../helpers/producers';

import { HelloClass } from './HelloClass';

const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({ port: 4200, level: LogLevel.Fatal });

describe(ChildProcessProxyWorker.name, () => {
  let processOnStub: sinon.SinonStub;
  let processSendStub: sinon.SinonStub;
  let processListenersStub: sinon.SinonStub;
  let configureChildProcessStub: sinon.SinonStub;
  let processRemoveListenerStub: sinon.SinonStub;
  let processChdirStub: sinon.SinonStub;
  let logMock: Mock<Logger>;
  let originalProcessSend: typeof process.send;
  let processes: NodeJS.MessageListener[];
  const workingDir = 'working dir';

  beforeEach(() => {
    processes = [];
    logMock = currentLogMock();
    processOnStub = sinon.stub(process, 'on');
    processListenersStub = sinon.stub(process, 'listeners');
    processListenersStub.returns(processes);
    processRemoveListenerStub = sinon.stub(process, 'removeListener');
    processSendStub = sinon.stub();
    // process.send is normally undefined
    originalProcessSend = process.send;
    process.send = processSendStub;
    processChdirStub = sinon.stub(process, 'chdir');
    configureChildProcessStub = sinon.stub(LogConfigurator, 'configureChildProcess');
    sinon.stub(di, 'buildChildProcessInjector').returns(testInjector.injector);
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
      const options = factory.strykerOptions();
      initMessage = {
        additionalInjectableValues: { name: 'FooBarName' },
        kind: WorkerMessageKind.Init,
        loggingContext: LOGGING_CONTEXT,
        options,
        requireName: HelloClass.name,
        requirePath: require.resolve('./HelloClass'),
        workingDirectory: workingDir,
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

    it("should not change the current working directory if it didn't change", () => {
      initMessage.workingDirectory = process.cwd();
      processOnMessage(initMessage);
      expect(logMock.debug).not.called;
      expect(processChdirStub).not.called;
    });

    it('should send "init_done"', async () => {
      processOnMessage(initMessage);
      const expectedWorkerResponse: ParentMessage = { kind: ParentMessageKind.Initialized };
      await tick(); // make sure promise is resolved
      expect(processSendStub).calledWith(JSON.stringify(expectedWorkerResponse));
    });

    it('should remove any additional listeners', async () => {
      // Arrange
      function noop() {}
      processes.push(noop);

      // Act
      processOnMessage(initMessage);
      await tick(); // make sure promise is resolved

      // Assert
      expect(processRemoveListenerStub).calledWith('message', noop);
    });

    it('should set global log level', () => {
      processOnStub.callArgWith(1, JSON.stringify(initMessage));
      expect(configureChildProcessStub).calledWith(LOGGING_CONTEXT);
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
        expect(processSendStub).calledWith(JSON.stringify(expectedResult));
      }

      async function actAndAssertRejection(workerMessage: CallMessage, expectedError: string) {
        // Act
        processOnMessage(initMessage);
        processOnMessage(workerMessage);
        await tick();
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
    processOnStub.withArgs('message').callArgWith(1, [JSON.stringify(message)]);
  }
});

function tick() {
  return new Promise((res) => setTimeout(res, 0));
}
