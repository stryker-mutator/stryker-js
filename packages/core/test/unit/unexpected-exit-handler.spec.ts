import { EventEmitter } from 'events';

import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';
import { expect } from 'chai';

import { coreTokens } from '../../src/di/index.js';
import { UnexpectedExitHandler } from '../../src/unexpected-exit-handler.js';

class ProcessMock extends EventEmitter {
  public exit = sinon.stub();
}
const signals = Object.freeze(['SIGABRT', 'SIGINT', 'SIGHUP', 'SIGTERM']);

describe(UnexpectedExitHandler.name, () => {
  let processMock: ProcessMock;

  beforeEach(() => {
    processMock = new ProcessMock();
  });

  function createSut() {
    return testInjector.injector
      .provideValue(
        coreTokens.process,
        processMock as unknown as Pick<NodeJS.Process, 'exit' | 'off' | 'on'>,
      )
      .injectClass(UnexpectedExitHandler);
  }

  describe('constructor', () => {
    it('should register an "exit" handler', () => {
      createSut();
      expect(processMock.listenerCount('exit')).eq(1);
    });

    signals.forEach((signal) => {
      it(`should register a "${signal}" signal handler`, () => {
        createSut();
        expect(processMock.listenerCount(signal)).eq(1);
      });
    });
  });

  describe('dispose', () => {
    it('should remove the "exit" handler', () => {
      createSut().dispose();
      expect(processMock.listenerCount('exit')).eq(0);
    });

    signals.forEach((signal) => {
      it(`should remove the "${signal}" signal handler`, () => {
        createSut().dispose();
        expect(processMock.listenerCount(signal)).eq(0);
      });
    });
  });

  signals.forEach((signal) => {
    it(`should call process.exit on "${signal}" signal`, () => {
      createSut();
      processMock.emit(signal, signal, 4);
      expect(processMock.exit).calledWith(132);
    });

    it(`should force-exit on second "${signal}" signal`, () => {
      createSut();
      // First signal: normal path — no async handlers registered, so exit() is called immediately.
      // This also sets shuttingDown = true inside the handler.
      processMock.emit(signal, signal, 4);
      // After the first signal, exit() has already been called once.
      // Reset the call history so the final assertion only checks
      // whether the *second* signal independently caused an exit call.
      processMock.exit.resetHistory();
      // Second signal: shuttingDown is already true, so the force-exit branch fires immediately
      // without waiting for any async handlers.
      processMock.emit(signal, signal, 4);
      // 128 + 4 (signal number), per POSIX convention for signal-terminated processes
      expect(processMock.exit).calledWith(132);
    });
  });

  describe(UnexpectedExitHandler.prototype.registerSyncHandler.name, () => {
    it('should call sync handlers on the "exit" event', () => {
      const handler = sinon.stub();
      const sut = createSut();
      sut.registerSyncHandler(handler);
      processMock.emit('exit');
      expect(handler).calledOnce;
    });

    it('should call sync handlers on signal before process.exit', () => {
      const handler = sinon.stub();
      const sut = createSut();
      sut.registerSyncHandler(handler);
      processMock.emit('SIGINT', 'SIGINT', 2);
      expect(handler).calledOnce;
      expect(processMock.exit).calledWith(130);
    });

    it('should not run sync handlers twice when a signal triggers process.exit', () => {
      const handler = sinon.stub();
      const sut = createSut();
      sut.registerSyncHandler(handler);
      processMock.emit('SIGINT', 'SIGINT', 2);
      // Mimic Node: process.exit() emits 'exit'
      processMock.emit('exit');
      expect(handler).calledOnce;
    });

    it('should still call process.exit when a sync handler throws', () => {
      const consoleErrorStub = sinon.stub(console, 'error');
      const sut = createSut();
      sut.registerSyncHandler(() => {
        throw new Error('restore failed');
      });
      processMock.emit('SIGINT', 'SIGINT', 2);
      expect(processMock.exit).calledWith(130);
      expect(consoleErrorStub).calledWith(
        'Unexpected exit sync handler failed:',
        sinon.match.instanceOf(Error),
      );
      consoleErrorStub.restore();
    });

    it('should run remaining sync handlers when one throws', () => {
      const consoleErrorStub = sinon.stub(console, 'error');
      const second = sinon.stub();
      const sut = createSut();
      sut.registerSyncHandler(() => {
        throw new Error('first failed');
      });
      sut.registerSyncHandler(second);
      processMock.emit('exit');
      expect(second).calledOnce;
      consoleErrorStub.restore();
    });
  });

  describe(UnexpectedExitHandler.prototype.registerHandler.name, () => {
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
      // Fake timers are required because the signal handler uses `Promise.allSettled().then()` internally.
      // Without draining the microtask queue manually, the promise chain never resolves within the test.
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('should call the provided handler on signal', async () => {
      const handler = sinon.stub().resolves();
      const sut = createSut();
      sut.registerHandler(handler);
      processMock.emit('SIGINT', 'SIGINT', 2);
      // Drain the Promise queue so the async handler and all .then() callbacks complete.
      await clock.runAllAsync();
      expect(handler).called;
    });

    it('should call process.exit with the correct exit code after handlers complete', async () => {
      const handler = sinon.stub().resolves();
      const sut = createSut();
      sut.registerHandler(handler);
      processMock.emit('SIGINT', 'SIGINT', 2);
      // Drain the Promise queue so the .then(() => process.exit()) callback fires.
      await clock.runAllAsync();
      // 128 + 2 (SIGINT signal number), per POSIX convention for signal-terminated processes
      expect(processMock.exit).calledWith(130);
    });

    it('should call process.exit even when a handler rejects', async () => {
      const handler = sinon.stub().rejects(new Error('handler failed'));
      const sut = createSut();
      sut.registerHandler(handler);
      processMock.emit('SIGTERM', 'SIGTERM', 15);
      // Promise.allSettled() is used internally, so a rejection does not prevent
      // the .then() callback (which calls process.exit()) from running.
      await clock.runAllAsync();
      expect(processMock.exit).calledWith(143); // 128 + 15
    });

    it('should call all handlers even if one rejects', async () => {
      const failingHandler = sinon.stub().rejects(new Error('handler failed'));
      const successHandler = sinon.stub().resolves();
      const sut = createSut();
      sut.registerHandler(failingHandler);
      sut.registerHandler(successHandler);
      processMock.emit('SIGTERM', 'SIGTERM', 15);
      // Promise.allSettled() runs all handlers concurrently and collects all results,
      // regardless of individual rejections, so the successHandler must still run.
      await clock.runAllAsync();
      expect(failingHandler).called;
      expect(successHandler).called;
    });

    it('should force-exit on second signal without running handlers again', async () => {
      const handler = sinon.stub().resolves();
      const sut = createSut();
      sut.registerHandler(handler);
      // First signal: async handlers are running, shuttingDown = true.
      processMock.emit('SIGINT', 'SIGINT', 2);
      // Second signal arrives while handlers promises are not yet resolved).
      // The force-exit branch fires: process.exit() is called immediately with the
      // second signal's exit code, without waiting for the handlers or re-invoking them.
      processMock.emit('SIGTERM', 'SIGTERM', 15);
      await clock.runAllAsync();
      // The async handler was only triggered by the first signal, not the second.
      expect(handler).calledOnce;
      // 128 + 15 (SIGTERM signal number), per POSIX convention for signal-terminated processes
      expect(processMock.exit).calledWith(143);
    });

    it('should log "Forced exit." to stderr on second signal', async () => {
      const consoleErrorStub = sinon.stub(console, 'error');
      const handler = sinon.stub().resolves();
      const sut = createSut();
      sut.registerHandler(handler);
      // First signal starts async shutdown; second signal hits the force-exit branch.
      processMock.emit('SIGINT', 'SIGINT', 2);
      processMock.emit('SIGINT', 'SIGINT', 2);
      // The force-exit branch logs to stderr before calling process.exit(),
      // so the user knows why the process exited abruptly.
      expect(consoleErrorStub).calledWith(
        'Forced exit. Received signal again while shutting down.',
      );
      consoleErrorStub.restore();
      await clock.runAllAsync();
    });

    it('should run sync handlers before async handlers on signal', async () => {
      const order: string[] = [];
      let releaseAsync!: () => void;
      const asyncGate = new Promise<void>((resolve) => {
        releaseAsync = resolve;
      });
      const sut = createSut();
      sut.registerSyncHandler(() => {
        order.push('sync');
      });
      sut.registerHandler(async () => {
        await asyncGate;
        order.push('async');
      });
      processMock.emit('SIGINT', 'SIGINT', 2);
      expect(order).deep.eq(['sync']);
      releaseAsync();
      await clock.runAllAsync();
      expect(order).deep.eq(['sync', 'async']);
    });

    it('should not call async handlers on the "exit" event', () => {
      const asyncHandler = sinon.stub().resolves();
      const sut = createSut();
      sut.registerHandler(asyncHandler);
      processMock.emit('exit');
      expect(asyncHandler).not.called;
    });
  });
});
