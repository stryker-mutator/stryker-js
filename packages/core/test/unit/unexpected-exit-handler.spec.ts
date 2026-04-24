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
    it('should register an exit handler', () => {
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

    it(`should remove all signal listeners on "${signal}" signal to prevent re-entrant handling`, () => {
      createSut();
      processMock.emit(signal, signal, 4);
      signals.forEach((s) => {
        expect(processMock.listenerCount(s)).eq(0);
      });
    });
  });

  describe(UnexpectedExitHandler.prototype.registerHandler.name, () => {
    it('should call the provided handler on exit', () => {
      const exitHandler = sinon.stub();
      const sut = createSut();
      sut.registerHandler(exitHandler);
      processMock.emit('exit');
      expect(exitHandler).called;
    });
  });

  describe(UnexpectedExitHandler.prototype.registerAsyncHandler.name, () => {
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('should call the provided async handler on signal', async () => {
      const asyncHandler = sinon.stub().resolves();
      const sut = createSut();
      sut.registerAsyncHandler(asyncHandler);
      processMock.emit('SIGINT', 'SIGINT', 2);
      await clock.runAllAsync();
      expect(asyncHandler).called;
    });

    it('should call process.exit with the correct exit code after async handlers complete', async () => {
      const asyncHandler = sinon.stub().resolves();
      const sut = createSut();
      sut.registerAsyncHandler(asyncHandler);
      processMock.emit('SIGINT', 'SIGINT', 2);
      await clock.runAllAsync();
      expect(processMock.exit).calledWith(130); // 128 + 2
    });

    it('should call process.exit even when an async handler rejects', async () => {
      const asyncHandler = sinon.stub().rejects(new Error('handler failed'));
      const sut = createSut();
      sut.registerAsyncHandler(asyncHandler);
      processMock.emit('SIGTERM', 'SIGTERM', 15);
      await clock.runAllAsync();
      expect(processMock.exit).calledWith(143); // 128 + 15
    });

    it('should call all async handlers even if one rejects', async () => {
      const failingHandler = sinon.stub().rejects(new Error('handler failed'));
      const successHandler = sinon.stub().resolves();
      const sut = createSut();
      sut.registerAsyncHandler(failingHandler);
      sut.registerAsyncHandler(successHandler);
      processMock.emit('SIGTERM', 'SIGTERM', 15);
      await clock.runAllAsync();
      expect(failingHandler).called;
      expect(successHandler).called;
    });

    it('should not call the async handler on the "exit" event', async () => {
      const asyncHandler = sinon.stub().resolves();
      const sut = createSut();
      sut.registerAsyncHandler(asyncHandler);
      processMock.emit('exit');
      await clock.runAllAsync();
      expect(asyncHandler).not.called;
    });

    it('should remove signal listeners on first signal to prevent re-entrant handling', async () => {
      const asyncHandler = sinon.stub().resolves();
      const sut = createSut();
      sut.registerAsyncHandler(asyncHandler);
      processMock.emit('SIGINT', 'SIGINT', 2);
      signals.forEach((signal) => {
        expect(processMock.listenerCount(signal)).eq(0);
      });
      await clock.runAllAsync();
    });

    it('should not run async handlers again on a second signal', async () => {
      const asyncHandler = sinon.stub().resolves();
      const sut = createSut();
      sut.registerAsyncHandler(asyncHandler);
      processMock.emit('SIGINT', 'SIGINT', 2);
      // Second signal should be a no-op (listeners removed)
      processMock.emit('SIGINT', 'SIGINT', 2);
      await clock.runAllAsync();
      expect(asyncHandler).calledOnce;
    });
  });
});
