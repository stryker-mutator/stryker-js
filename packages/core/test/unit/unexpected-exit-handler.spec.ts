import { EventEmitter } from 'events';

import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';
import { expect } from 'chai';

import { coreTokens } from '../../src/di';
import { UnexpectedExitHandler } from '../../src/unexpected-exit-handler';

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
      .provideValue(coreTokens.process, (processMock as unknown) as Pick<NodeJS.Process, 'exit' | 'off' | 'on'>)
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
});
