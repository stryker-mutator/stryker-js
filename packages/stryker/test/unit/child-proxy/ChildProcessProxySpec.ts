import * as os from 'os';
import { expect } from 'chai';
import * as childProcess from 'child_process';
import ChildProcessProxy from '../../../src/child-proxy/ChildProcessProxy';
import { autoStart, InitMessage, WorkerMessageKind, ParentMessage, WorkerMessage, ParentMessageKind, DisposeMessage } from '../../../src/child-proxy/messageProtocol';
import { serialize } from '../../../src/utils/objectUtils';
import HelloClass from './HelloClass';
import LoggingClientContext from '../../../src/logging/LoggingClientContext';
import { LogLevel } from 'stryker-api/core';
import * as objectUtils from '../../../src/utils/objectUtils';
import { EventEmitter } from 'events';
import { Logger } from 'stryker-api/logging';
import { Mock } from '../../helpers/producers';
import currentLogMock from '../../helpers/logMock';

const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({
  port: 4200,
  level: LogLevel.Fatal
});

class ChildProcessMock extends EventEmitter {
  send = sandbox.stub();
  stderr = new EventEmitter();
  stdout = new EventEmitter();
  pid = 4648;
}

describe('ChildProcessProxy', () => {

  let sut: ChildProcessProxy<HelloClass>;
  let forkStub: sinon.SinonStub;
  let childProcessMock: ChildProcessMock;
  let killStub: sinon.SinonStub;
  let logMock: Mock<Logger>;

  beforeEach(() => {
    childProcessMock = new ChildProcessMock();
    forkStub = sandbox.stub(childProcess, 'fork');
    killStub = sandbox.stub(objectUtils, 'kill');
    forkStub.returns(childProcessMock);
    logMock = currentLogMock();
  });

  afterEach(() => {
    childProcessMock.removeAllListeners();
    childProcessMock.stderr.removeAllListeners();
    childProcessMock.stdout.removeAllListeners();
  });

  describe('constructor', () => {

    it('should create child process', () => {
      sut = createSut();
      expect(forkStub).calledWith(require.resolve('../../../src/child-proxy/ChildProcessProxyWorker'), [autoStart], { silent: true, execArgv: [] });
    });

    it('should send init message to child process', () => {
      const expectedMessage: InitMessage = {
        kind: WorkerMessageKind.Init,
        loggingContext: LOGGING_CONTEXT,
        plugins: ['examplePlugin', 'secondExamplePlugin'],
        requirePath: 'foobar',
        constructorArgs: ['something'],
        workingDirectory: 'workingDirectory'
      };

      // Act
      createSut({
        arg: expectedMessage.constructorArgs[0],
        loggingContext: LOGGING_CONTEXT,
        plugins: expectedMessage.plugins,
        workingDir: expectedMessage.workingDirectory,
        requirePath: expectedMessage.requirePath
      });
      ChildProcessProxy.create(expectedMessage.requirePath, LOGGING_CONTEXT, expectedMessage.plugins,
        expectedMessage.workingDirectory, HelloClass, expectedMessage.constructorArgs[0]);

      // Assert
      expect(childProcessMock.send).calledWith(serialize(expectedMessage));
    });

    it('should listen to worker process', () => {
      createSut();
      expect(childProcessMock.listeners('message')).lengthOf(1);
    });

    it('should listen for exit calls', () => {
      createSut();
      expect(childProcessMock.listeners('exit')).lengthOf(1);
    });
  });

  describe('on exit', () => {
    beforeEach(() => {
      sut = createSut();
    });

    it('should log stdout and stderr on warning', () => {
      childProcessMock.stderr.emit('data', 'foo');
      childProcessMock.stdout.emit('data', 'bar');
      actExit(23, 'SIGTERM');
      expect(logMock.warn).calledWithMatch(`Child process [pid ${childProcessMock.pid}] exited unexpectedly with exit code 23 (SIGTERM). Last part of stdout and stderr was: ${os.EOL
        }\tfoo${os.EOL}\tbar`);
    });

    it('should log that no stdout was available', () => {
      actExit(23, 'SIGTERM');
      expect(logMock.warn).calledWith(`Child process [pid ${childProcessMock.pid}] exited unexpectedly with exit code 23 (SIGTERM). Stdout and stderr were empty.`);
    });

    it('should reject any outstanding worker promises with the error', () => {
      const expectedError = 'Child process exited unexpectedly (code 646)';
      const actualPromise = sut.proxy.say('test');
      actExit(646);
      return expect(actualPromise).rejectedWith(expectedError);
    });
    
    it('should reject any new calls immediately', () => {
      actExit(646);
      return expect(sut.proxy.say('')).rejected;
    });

    function actExit(code = 1, signal = 'SIGINT') {
      childProcessMock.emit('exit', code, signal);
    }
  });

  describe('when calling methods', () => {

    beforeEach(() => {
      sut = createSut();
      receiveMessage({ kind: ParentMessageKind.Initialized });
    });

    it('should proxy the message', async () => {
      // Arrange
      const workerResponse: ParentMessage = {
        kind: ParentMessageKind.Result,
        correlationId: 0,
        result: 'ack'
      };
      const expectedWorkerMessage: WorkerMessage = {
        kind: WorkerMessageKind.Call,
        correlationId: 0,
        methodName: 'sayHello',
        args: ['echo']
      };

      // Act
      const delayedEcho = sut.proxy.sayHello('echo');
      await tick();
      receiveMessage(workerResponse);
      const result: string = await delayedEcho;

      // Assert
      expect(result).eq('ack');
      expect(childProcessMock.send).calledWith(serialize(expectedWorkerMessage));
    });
  });

  describe('dispose', () => {

    beforeEach(() => {
      sut = createSut();
    });

    it('should send a dispose message', async () => {
      await actDispose();
      const expectedWorkerMessage: DisposeMessage = { kind: WorkerMessageKind.Dispose };
      expect(childProcessMock.send).calledWith(serialize(expectedWorkerMessage));
    });

    it('should kill the child process', async () => {
      await actDispose();
      expect(killStub).calledWith(childProcessMock.pid);
    });

    it('should not do anything if already disposed', async () => {
      await actDispose();
      await actDispose();
      expect(killStub).calledOnce;
      expect(childProcessMock.send).calledTwice; // 1 init, 1 dispose
    });

    it('should not do anything if the process already exited', async () => {
      childProcessMock.emit('exit', 1);
      await actDispose();
      expect(killStub).not.called;
      expect(childProcessMock.send).calledOnce; // init
    });

    async function actDispose() {
      const disposePromise = sut.dispose();
      receiveMessage({ kind: ParentMessageKind.DisposeCompleted });
      await disposePromise;
    }

  });

  function receiveMessage(workerResponse: ParentMessage) {
    childProcessMock.emit('message', serialize(workerResponse));
  }
});

function tick() {
  return new Promise(res => setTimeout(res, 0));
}

function createSut(overrides: {
  requirePath?: string;
  loggingContext?: LoggingClientContext;
  plugins?: string[];
  workingDir?: string;
  arg?: string;
} = {}): ChildProcessProxy<HelloClass> {
  return ChildProcessProxy.create(
    overrides.requirePath || 'foobar',
    overrides.loggingContext || LOGGING_CONTEXT,
    overrides.plugins || ['examplePlugin', 'secondExamplePlugin'],
    overrides.workingDir || 'workingDir',
    HelloClass,
    overrides.arg || 'someArg');
}
