import childProcess, { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import os from 'os';
import { fileURLToPath, URL } from 'url';

import { FileDescriptions, LogLevel, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { factory, tick } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { ChildProcessProxy } from '../../../src/child-proxy/child-process-proxy.js';
import {
  CallMessage,
  DisposeMessage,
  InitMessage,
  ParentMessage,
  ParentMessageKind,
  WorkerMessage,
  WorkerMessageKind,
} from '../../../src/child-proxy/message-protocol.js';
import { LoggingClientContext } from '../../../src/logging/index.js';
import * as stringUtils from '../../../src/utils/string-utils.js';
import { objectUtils } from '../../../src/utils/object-utils.js';
import { OutOfMemoryError } from '../../../src/child-proxy/out-of-memory-error.js';
import { currentLogMock } from '../../helpers/log-mock.js';
import { Mock } from '../../helpers/producers.js';

import { IdGenerator } from '../../../src/child-proxy/id-generator.js';

import { HelloClass } from './hello-class.js';

const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({
  level: LogLevel.Fatal,
  port: 4200,
});

class ChildProcessMock extends EventEmitter {
  public send: sinon.SinonStubbedMember<ChildProcess['send']> = sinon.stub();
  public stderr = new EventEmitter();
  public stdout = new EventEmitter();
  public pid = 4648;
}

let idGeneratorStub: sinon.SinonStubbedInstance<IdGenerator>;

describe(ChildProcessProxy.name, () => {
  let sut: ChildProcessProxy<HelloClass>;
  let forkStub: sinon.SinonStub;
  let childProcessMock: ChildProcessMock;
  let killStub: sinon.SinonStub;
  let logMock: Mock<Logger>;
  const workerId = 5;

  beforeEach(() => {
    childProcessMock = new ChildProcessMock();
    forkStub = sinon.stub(childProcess, 'fork');
    killStub = sinon.stub(objectUtils, 'kill');
    forkStub.returns(childProcessMock);
    logMock = currentLogMock();
    idGeneratorStub = sinon.createStubInstance(IdGenerator);
    idGeneratorStub.next.returns(workerId);
  });

  afterEach(() => {
    childProcessMock.removeAllListeners();
    childProcessMock.stderr.removeAllListeners();
    childProcessMock.stdout.removeAllListeners();
  });

  describe('constructor', () => {
    it('should create child process', () => {
      sut = createSut();
      expect(forkStub).calledWith(fileURLToPath(new URL('../../../src/child-proxy/child-process-proxy-worker.js', import.meta.url)), {
        silent: true,
        execArgv: [],
        env: { STRYKER_MUTATOR_WORKER: workerId.toString(), ...process.env },
      });
    });

    it('should not directly send the init message', () => {
      // https://github.com/nodejs/node/issues/41134#issuecomment-1024972805
      createSut();
      expect(childProcessMock.send).not.called;
    });

    it('should log the exec arguments and require name', () => {
      // Act
      createSut({
        loggingContext: LOGGING_CONTEXT,
        execArgv: ['--cpu-prof', '--inspect'],
        idGenerator: idGeneratorStub,
      });
      // Assert
      expect(logMock.debug).calledWith(
        'Started %s in worker process %s with pid %s %s',
        'HelloClass',
        workerId.toString(),
        childProcessMock.pid,
        ' (using args --cpu-prof --inspect)',
      );
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
      expect(forkStub).calledWithMatch(sinon.match.string, sinon.match({ execArgv: ['--inspect-brk'] }));
    });

    it('should send init message to child process when the Ready message is received', () => {
      const expectedMessage: InitMessage = {
        kind: WorkerMessageKind.Init,
        loggingContext: LOGGING_CONTEXT,
        options: factory.strykerOptions({ testRunner: 'Hello' }),
        fileDescriptions: { 'foo.js': { mutate: true } },
        pluginModulePaths: ['foo'],
        namedExport: 'HelloClass',
        modulePath: 'foobar',
        workingDirectory: 'workingDirectory',
      };
      createSut({
        loggingContext: LOGGING_CONTEXT,
        options: expectedMessage.options,
        requirePath: expectedMessage.modulePath,
        workingDir: expectedMessage.workingDirectory,
        pluginModulePaths: expectedMessage.pluginModulePaths,
      });

      // Act
      receiveMessage({ kind: ParentMessageKind.Ready });

      // Assert
      expect(childProcessMock.send).calledWith(stringUtils.serialize(expectedMessage));
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
        `Child process [pid ${childProcessMock.pid}] exited unexpectedly with exit code 23 (SIGTERM). Last part of stdout and stderr was:${os.EOL}\tfoo${os.EOL}\tbar`,
      );
    });

    it('should log that no stdout was available when stdout and stderr are empty', () => {
      actClose(23, 'SIGTERM');
      expect(logMock.warn).calledWith(
        `Child process [pid ${childProcessMock.pid}] exited unexpectedly with exit code 23 (SIGTERM). Stdout and stderr were empty.`,
      );
    });

    it('should log stdout and stderr in correct order', () => {
      childProcessMock.stdout.emit('data', 'foo');
      childProcessMock.stderr.emit('data', 'baz');
      childProcessMock.stdout.emit('data', 'bar');
      actClose(23, 'SIGTERM');
      expect(logMock.warn).calledWith(
        `Child process [pid ${childProcessMock.pid}] exited unexpectedly with exit code 23 (SIGTERM). Last part of stdout and stderr was:${os.EOL}\tbaz${os.EOL}\tfoobar`,
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

    it('should handle "JavaScript heap out of memory" as an OOM error', async () => {
      // Arrange
      childProcessMock.stderr.emit('data', 'some other output');
      childProcessMock.stderr.emit('data', ' JavaScript ');
      childProcessMock.stderr.emit('data', 'heap out of memory');
      childProcessMock.stderr.emit('data', ' some more data"');

      // Act
      actClose(123);

      // Assert
      await expect(sut.proxy.say('')).rejectedWith(OutOfMemoryError);
    });

    it('should handle "FatalProcessOutOfMemory" as an OOM error', async () => {
      // Arrange
      childProcessMock.stderr.emit(
        'data',
        '3: 0xb797be v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t 4: 0xb79b37 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t 5: 0xd343c5  [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t 6: 0xd34f4f  [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t 7: 0xd42fdb v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t 8: 0xd457ae v8::internal::Heap::CollectAllAvailableGarbage(v8::internal::GarbageCollectionReason) [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t 9: 0xd46beb v8::internal::Heap::AllocateRawWithRetryOrFailSlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t10: 0xd0c4a2 v8::internal::Factory::AllocateRaw(int, v8::internal::AllocationType, v8::internal::AllocationAlignment) [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t11: 0xd086f2 v8::internal::FactoryBase<v8::internal::Factory>::AllocateRawArray(int, v8::internal::AllocationType) [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t12: 0xd087a4 v8::internal::FactoryBase<v8::internal::Factory>::NewFixedArrayWithFiller(v8::internal::Handle<v8::internal::Map>, int, v8::internal::Handle<v8::internal::Oddball>, v8::internal::AllocationType) [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t13: 0xe9568e  [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t14: 0xe957da  [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t15: 0x1032b83 v8::internal::Runtime_GrowArrayElements(int, unsigned long*, v8::internal::Isolate*) [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t16: 0x14011f9  [/opt/hostedtoolcache/node/14.15.4/x64/bin/node]\n\t',
      );

      // Act
      actClose(123);

      // Assert
      await expect(sut.proxy.say('')).rejectedWith(OutOfMemoryError);
    });

    function actClose(code = 1, signal = 'SIGINT') {
      childProcessMock.emit('close', code, signal);
    }
  });

  describe('init', () => {
    it('should kill the child process on init error', async () => {
      // Arrange
      createSut();
      receiveMessage({ kind: ParentMessageKind.Ready });

      // Act
      receiveMessage({ kind: ParentMessageKind.InitError, error: 'some error' });

      // Assert
      await assertDisposedCorrectly();
    });

    it('should reject messages when the child process rejects with init error', async () => {
      // Arrange
      sut = createSut();
      receiveMessage({ kind: ParentMessageKind.Ready });

      // Act
      receiveMessage({ kind: ParentMessageKind.InitError, error: 'some error' });

      // Assert
      await expect(sut.proxy.sayHello()).rejectedWith('some error');
      await assertDisposedCorrectly();
    });

    async function assertDisposedCorrectly() {
      const expectedDispose: WorkerMessage = { kind: WorkerMessageKind.Dispose };
      sinon.assert.calledWithExactly(childProcessMock.send, JSON.stringify(expectedDispose));
      receiveMessage({ kind: ParentMessageKind.DisposeCompleted });
      await tick();
      expect(killStub).calledWith(childProcessMock.pid);
    }
  });

  describe('when calling methods', () => {
    beforeEach(() => {
      sut = createSut();
    });

    it('should proxy the message', async () => {
      // Arrange
      const clock = sinon.useFakeTimers();
      receiveMessage({ kind: ParentMessageKind.Initialized });
      const workerResponse: ParentMessage = {
        correlationId: 0,
        kind: ParentMessageKind.CallResult,
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
      expect(childProcessMock.send).calledWith(stringUtils.serialize(expectedWorkerMessage));
    });

    it('should use a unique correlation id for each call', async () => {
      // Arrange
      const clock = sinon.useFakeTimers();
      receiveMessage({ kind: ParentMessageKind.Initialized });

      // Act
      const promises = [sut.proxy.say('echo'), sut.proxy.say('hello'), sut.proxy.sum(1, 2)];
      clock.tick(0);
      receiveMessage({ kind: ParentMessageKind.CallResult, correlationId: 0, result: 'ack' });
      receiveMessage({ kind: ParentMessageKind.CallResult, correlationId: 1, result: 'ack' });
      receiveMessage({ kind: ParentMessageKind.CallResult, correlationId: 2, result: 'ack' });
      await Promise.all(promises);

      // Assert
      sinon.assert.calledThrice(childProcessMock.send);
      const actualWorkerMessage1: CallMessage = JSON.parse(childProcessMock.send.firstCall.args[0] as string);
      const actualWorkerMessage2: CallMessage = JSON.parse(childProcessMock.send.secondCall.args[0] as string);
      const actualWorkerMessage3: CallMessage = JSON.parse(childProcessMock.send.thirdCall.args[0] as string);
      expect(actualWorkerMessage1.correlationId).eq(0);
      expect(actualWorkerMessage1.methodName).eq('say');
      expect(actualWorkerMessage1.args).deep.eq(['echo']);
      expect(actualWorkerMessage2.correlationId).eq(1);
      expect(actualWorkerMessage2.methodName).eq('say');
      expect(actualWorkerMessage2.args).deep.eq(['hello']);
      expect(actualWorkerMessage3.correlationId).eq(2);
      expect(actualWorkerMessage3.methodName).eq('sum');
      expect(actualWorkerMessage3.args).deep.eq([1, 2]);
    });

    it('should resolve correct promises when receiving responses', async () => {
      // Arrange
      const clock = sinon.useFakeTimers();
      receiveMessage({ kind: ParentMessageKind.Initialized });
      const delayedEcho = sut.proxy.say('echo');
      const delayedHello = sut.proxy.sayHello();
      clock.tick(0);
      receiveMessage({ kind: ParentMessageKind.CallResult, correlationId: 0, result: 'ack' });
      receiveMessage({ kind: ParentMessageKind.CallResult, correlationId: 1, result: 'Hello' });

      // Act
      const [echo, hello] = await Promise.all([delayedEcho, delayedHello]);

      // Assert
      expect(echo).eq('ack');
      expect(hello).eq('Hello');
    });

    it('should resolve correct promises when receiving responses out-of-order', async () => {
      // Arrange
      const clock = sinon.useFakeTimers();
      receiveMessage({ kind: ParentMessageKind.Initialized });
      const delayedEcho = sut.proxy.say('echo');
      const delayedHello = sut.proxy.sayHello();
      clock.tick(0);
      receiveMessage({ kind: ParentMessageKind.CallResult, correlationId: 1, result: 'Hello' });
      receiveMessage({ kind: ParentMessageKind.CallResult, correlationId: 0, result: 'ack' });

      // Act
      const [echo, hello] = await Promise.all([delayedEcho, delayedHello]);

      // Assert
      expect(echo).eq('ack');
      expect(hello).eq('Hello');
    });

    it('should wait with starting to proxy until initialized', async () => {
      // Arrange
      const onGoingCall = sut.proxy.sayHello();
      await tick();

      // Act & Assert
      expect(childProcessMock.send).not.called;
      receiveMessage({ kind: ParentMessageKind.Ready });
      await tick();
      expect(childProcessMock.send).calledOnce; // init
      receiveMessage({ kind: ParentMessageKind.Initialized });
      await tick();
      expect(childProcessMock.send).calledTwice; // call
      receiveMessage({ kind: ParentMessageKind.CallResult, correlationId: 0, result: 'Hello' });
      expect(await onGoingCall).eq('Hello');
    });
  });

  describe('dispose', () => {
    let clock: sinon.SinonFakeTimers;
    beforeEach(() => {
      sut = createSut();
      clock = sinon.useFakeTimers();
      receiveMessage({ kind: ParentMessageKind.Ready });
    });

    it('should send a dispose message', async () => {
      await actDispose();
      const expectedWorkerMessage: DisposeMessage = { kind: WorkerMessageKind.Dispose };
      expect(childProcessMock.send).calledWith(stringUtils.serialize(expectedWorkerMessage));
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
    childProcessMock.emit('message', stringUtils.serialize(workerResponse));
  }
});

function createSut({
  requirePath = 'foobar',
  loggingContext = LOGGING_CONTEXT,
  options = {},
  workingDir = 'workingDir',
  fileDescriptions = { 'foo.js': { mutate: true } },
  pluginModulePaths = ['plugin', 'path'],
  execArgv = [],
  idGenerator = idGeneratorStub,
}: {
  requirePath?: string;
  loggingContext?: LoggingClientContext;
  options?: Partial<StrykerOptions>;
  workingDir?: string;
  fileDescriptions?: FileDescriptions;
  pluginModulePaths?: readonly string[];
  execArgv?: string[];
  idGenerator?: sinon.SinonStubbedInstance<IdGenerator>;
} = {}): ChildProcessProxy<HelloClass> {
  return ChildProcessProxy.create(
    requirePath,
    loggingContext,
    factory.strykerOptions(options),
    fileDescriptions,
    pluginModulePaths,
    workingDir,
    HelloClass,
    execArgv,
    idGenerator,
  );
}
