import childProcess from 'child_process';
import { EventEmitter } from 'events';
import os from 'os';

import { LogLevel, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { ChildProcessProxy } from '../../../src/child-proxy/ChildProcessProxy';
import {
  autoStart,
  DisposeMessage,
  InitMessage,
  ParentMessage,
  ParentMessageKind,
  WorkerMessage,
  WorkerMessageKind,
} from '../../../src/child-proxy/messageProtocol';
import { LoggingClientContext } from '../../../src/logging';
import { serialize } from '../../../src/utils/objectUtils';
import * as objectUtils from '../../../src/utils/objectUtils';
import { currentLogMock } from '../../helpers/logMock';
import { Mock } from '../../helpers/producers';

import { HelloClass } from './HelloClass';

const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({
  level: LogLevel.Fatal,
  port: 4200,
});

class ChildProcessMock extends EventEmitter {
  public send = sinon.stub();
  public stderr = new EventEmitter();
  public stdout = new EventEmitter();
  public pid = 4648;
}

describe(ChildProcessProxy.name, () => {
  let sut: ChildProcessProxy<HelloClass>;
  let forkStub: sinon.SinonStub;
  let childProcessMock: ChildProcessMock;
  let killStub: sinon.SinonStub;
  let logMock: Mock<Logger>;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    childProcessMock = new ChildProcessMock();
    forkStub = sinon.stub(childProcess, 'fork');
    killStub = sinon.stub(objectUtils, 'kill');
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
        additionalInjectableValues: { name: 'fooTest' },
        kind: WorkerMessageKind.Init,
        loggingContext: LOGGING_CONTEXT,
        options: factory.strykerOptions(),
        requireName: 'HelloClass',
        requirePath: 'foobar',
        workingDirectory: 'workingDirectory',
      };

      // Act
      createSut({
        loggingContext: LOGGING_CONTEXT,
        name: (expectedMessage.additionalInjectableValues as { name: string }).name,
        options: expectedMessage.options,
        requirePath: expectedMessage.requirePath,
        workingDir: expectedMessage.workingDirectory,
      });

      // Assert
      expect(childProcessMock.send).calledWith(serialize(expectedMessage));
    });

    it('should listen to worker process', () => {
      createSut();
      expect(childProcessMock.listeners('message')).lengthOf(1);
    });

    it('should listen for close calls', () => {
      createSut();
      expect(childProcessMock.listeners('close')).lengthOf(1);
    });
  });

  describe('on close', () => {
    beforeEach(() => {
      sut = createSut();
    });

    it('should log stdout and stderr on warning', () => {
      childProcessMock.stdout.emit('data', 'bar');
      childProcessMock.stderr.emit('data', 'foo');
      actClose(23, 'SIGTERM');
      expect(logMock.warn).calledWithMatch(
        `Child process [pid ${childProcessMock.pid}] exited unexpectedly with exit code 23 (SIGTERM). Last part of stdout and stderr was:${os.EOL}\tfoo${os.EOL}\tbar`
      );
    });

    it('should log that no stdout was available when stdout and stderr are empty', () => {
      actClose(23, 'SIGTERM');
      expect(logMock.warn).calledWith(
        `Child process [pid ${childProcessMock.pid}] exited unexpectedly with exit code 23 (SIGTERM). Stdout and stderr were empty.`
      );
    });

    it('should log stdout and stderr in correct order', () => {
      childProcessMock.stdout.emit('data', 'foo');
      childProcessMock.stderr.emit('data', 'baz');
      childProcessMock.stdout.emit('data', 'bar');
      actClose(23, 'SIGTERM');
      expect(logMock.warn).calledWith(
        `Child process [pid ${childProcessMock.pid}] exited unexpectedly with exit code 23 (SIGTERM). Last part of stdout and stderr was:${os.EOL}\tbaz${os.EOL}\tfoobar`
      );
    });

    it('should reject any outstanding worker promises with the error', () => {
      const expectedError = 'Child process [pid 4648] exited unexpectedly with exit code 646 (SIGINT).';
      const actualPromise = sut.proxy.say('test');
      actClose(646);
      return expect(actualPromise).rejectedWith(expectedError);
    });

    it('should reject any new calls immediately', () => {
      actClose(646);
      return expect(sut.proxy.say('')).rejected;
    });

    function actClose(code = 1, signal = 'SIGINT') {
      childProcessMock.emit('close', code, signal);
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
        correlationId: 0,
        kind: ParentMessageKind.Result,
        result: 'ack',
      };
      const expectedWorkerMessage: WorkerMessage = {
        args: ['echo'],
        correlationId: 0,
        kind: WorkerMessageKind.Call,
        methodName: 'say',
      };

      // Act
      const delayedEcho = sut.proxy.say('echo');
      clock.tick(0);
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
      childProcessMock.emit('close', 1);
      await actDispose();
      expect(killStub).not.called;
      expect(childProcessMock.send).calledOnce; // init
    });

    it('should only wait for max 2 seconds before going ahead and killing the child process anyway', async () => {
      const disposePromise = sut.dispose();
      clock.tick(2000);
      await disposePromise;
      expect(killStub).called;
    });

    it('should remove "close" listener', async () => {
      expect(childProcessMock.listenerCount('close')).eq(1);
      await actDispose();
      expect(childProcessMock.listenerCount('close')).eq(0);
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

function createSut(
  overrides: {
    requirePath?: string;
    loggingContext?: LoggingClientContext;
    options?: Partial<StrykerOptions>;
    workingDir?: string;
    name?: string;
  } = {}
): ChildProcessProxy<HelloClass> {
  return ChildProcessProxy.create(
    overrides.requirePath || 'foobar',
    overrides.loggingContext || LOGGING_CONTEXT,
    factory.strykerOptions(overrides.options),
    { name: overrides.name || 'someArg' },
    overrides.workingDir || 'workingDir',
    HelloClass
  );
}
