import * as childProcess from 'child_process';
import { EventEmitter } from 'events';
import * as os from 'os';

import { LogLevel, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import ChildProcessProxy from '../../../src/child-proxy/child-process-proxy';
import {
  autoStart,
  DisposeMessage,
  InitMessage,
  ParentMessage,
  ParentMessageKind,
  WorkerMessage,
  WorkerMessageKind,
} from '../../../src/child-proxy/message-protocol';
import { LoggingClientContext } from '../../../src/logging';
import { serialize } from '../../../src/utils/object-utils';
import * as objectUtils from '../../../src/utils/object-utils';
import OutOfMemoryError from '../../../src/child-proxy/out-of-memory-error';
import currentLogMock from '../../helpers/log-mock';
import { Mock } from '../../helpers/producers';

import { HelloClass } from './hello-class';

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
      expect(forkStub).calledWith(require.resolve('../../../src/child-proxy/child-process-proxy-worker'), [autoStart], {
        silent: true,
        execArgv: [],
      });
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

    it('should log the exec arguments and require name', () => {
      // Act
      createSut({
        loggingContext: LOGGING_CONTEXT,
        execArgv: ['--cpu-prof', '--inspect'],
      });

      // Assert
      expect(logMock.debug).calledWith('Started %s in child process %s%s', 'HelloClass', childProcessMock.pid, ' (using args --cpu-prof --inspect)');
    });

    it('should listen to worker process', () => {
      createSut();
      expect(childProcessMock.listeners('message')).lengthOf(1);
    });

    it('should listen for close calls', () => {
      createSut();
      expect(childProcessMock.listeners('close')).lengthOf(1);
    });

    it('should set `execArgv`', () => {
      createSut({ execArgv: ['--inspect-brk'] });
      expect(forkStub).calledWithMatch(sinon.match.string, sinon.match.array, sinon.match({ execArgv: ['--inspect-brk'] }));
    });
  });

  describe('on unexpected close', () => {
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

    it('should handle "JavaScript heap out of memory" as an OOM error', () => {
      // Arrange
      childProcessMock.stderr.emit('data', 'some other output');
      childProcessMock.stderr.emit('data', ' JavaScript ');
      childProcessMock.stderr.emit('data', 'heap out of memory');
      childProcessMock.stderr.emit('data', ' some more data"');

      // Act
      actClose(123);

      // Assert
      expect(sut.proxy.say('')).rejectedWith(OutOfMemoryError);
    });

    it('should handle "allocation failure" as an OOM error', () => {
      // Arrange
      childProcessMock.stderr.emit(
        'data',
        ` <--- Last few GCs --->
      - t of marking 54 ms) (average mu = 0.846, current mu = 0.025) allocation failure[9832:0x49912a0]    14916 ms: Mark-sweep 196.8 (198.3) -> 196.9 (198.3) MB, 55.2 / 0.0 ms  (+ 4.5 ms in 17 steps since start of marking, biggest step 3.8 ms, walltime since start of marking 65 ms) (average mu = 0.728, current mu = 0.084) allocation failur[9832:0x49912a0]    14980 ms: Mark-sweep 196.9 (198.3) -> 196.9 (199.3) MB, 63.9 / 0.0 ms  (average mu = 0.559, current mu = 0.002) allocation failure scavenge might not succeed`
      );

      // Act
      actClose(123);

      // Assert
      expect(sut.proxy.say('')).rejectedWith(OutOfMemoryError);
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
    execArgv?: string[];
  } = {}
): ChildProcessProxy<HelloClass> {
  return ChildProcessProxy.create(
    overrides.requirePath || 'foobar',
    overrides.loggingContext || LOGGING_CONTEXT,
    factory.strykerOptions(overrides.options),
    { name: overrides.name || 'someArg' },
    overrides.workingDir || 'workingDir',
    HelloClass,
    overrides.execArgv ?? []
  );
}
