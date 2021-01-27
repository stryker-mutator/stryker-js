import { PluginKind } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { coreTokens } from '../../../src/di';
import { PluginCreator } from '../../../src/di/plugin-creator';
import { BroadcastReporter } from '../../../src/reporters/broadcast-reporter';

describe('BroadcastReporter', () => {
  let sut: BroadcastReporter;
  let rep1: sinon.SinonStubbedInstance<Required<Reporter>>;
  let rep2: sinon.SinonStubbedInstance<Required<Reporter>>;
  let isTTY: boolean;
  let pluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator<PluginKind.Reporter>>;

  beforeEach(() => {
    captureTTY();
    testInjector.options.reporters = ['rep1', 'rep2'];
    rep1 = factory.reporter('rep1');
    rep2 = factory.reporter('rep2');
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    pluginCreatorMock.create.withArgs('rep1').returns(rep1).withArgs('rep2').returns(rep2);
  });

  afterEach(() => {
    restoreTTY();
  });

  describe('when constructed', () => {
    it('should create "progress-append-only" instead of "progress" reporter if process.stdout is not a tty', () => {
      // Arrange
      setTTY(false);
      const expectedReporter = factory.reporter('progress-append-only');
      testInjector.options.reporters = ['progress'];
      pluginCreatorMock.create.returns(expectedReporter);

      // Act
      sut = createSut();

      // Assert
      expect(sut.reporters).deep.eq({ 'progress-append-only': expectedReporter });
      expect(pluginCreatorMock.create).calledWith('progress-append-only');
    });

    it('should create the correct reporters', () => {
      // Arrange
      setTTY(true);
      testInjector.options.reporters = ['progress', 'rep2'];
      const progress = factory.reporter('progress');
      pluginCreatorMock.create.withArgs('progress').returns(progress);

      // Act
      sut = createSut();

      // Assert
      expect(sut.reporters).deep.eq({
        progress,
        rep2,
      });
    });

    it('should warn if there is no reporter', () => {
      testInjector.options.reporters = [];
      sut = createSut();
      expect(testInjector.logger.warn).calledWith(sinon.match('No reporter configured'));
    });
  });

  describe('when created', () => {
    beforeEach(() => {
      sut = createSut();
    });

    it('should forward all events', () => {
      actArrangeAssertAllEvents();
    });

    describe('when "wrapUp" returns promises', () => {
      let wrapUpResolveFn: (value?: void | PromiseLike<void>) => void;
      let wrapUpResolveFn2: (value?: void | PromiseLike<void>) => void;
      let wrapUpRejectFn: (reason?: any) => void;
      let result: Promise<void>;
      let isResolved: boolean;

      beforeEach(() => {
        isResolved = false;
        rep1.wrapUp.returns(
          new Promise<void>((resolve, reject) => {
            wrapUpResolveFn = resolve;
            wrapUpRejectFn = reject;
          })
        );
        rep2.wrapUp.returns(new Promise<void>((resolve) => (wrapUpResolveFn2 = resolve)));
        result = sut.wrapUp().then(() => void (isResolved = true));
      });

      it('should forward a combined promise', () => {
        expect(isResolved).to.be.eq(false);
        wrapUpResolveFn();
        wrapUpResolveFn2();
        return result;
      });

      describe('and one of the promises results in a rejection', () => {
        let actualError: Error;
        beforeEach(() => {
          actualError = new Error('some error');
          wrapUpRejectFn(actualError);
          wrapUpResolveFn2();
          return result;
        });

        it('should not result in a rejection', () => result);

        it('should log the error', () => {
          expect(testInjector.logger.error).calledWith("An error occurred during 'wrapUp' on reporter 'rep1'.", actualError);
        });
      });
    });

    describe('with one faulty reporter', () => {
      let actualError: Error;

      beforeEach(() => {
        actualError = new Error('some error');
        factory.ALL_REPORTER_EVENTS.forEach((eventName) => rep1[eventName].throws(actualError));
      });

      it('should still broadcast to other reporters', () => {
        actArrangeAssertAllEvents();
      });

      it('should log each error', () => {
        factory.ALL_REPORTER_EVENTS.forEach((eventName) => {
          (sut as any)[eventName]();
          expect(testInjector.logger.error).to.have.been.calledWith(`An error occurred during '${eventName}' on reporter 'rep1'.`, actualError);
        });
      });
    });
  });

  function createSut() {
    return testInjector.injector
      .provideValue(coreTokens.pluginCreatorReporter, (pluginCreatorMock as unknown) as PluginCreator<PluginKind.Reporter>)
      .injectClass(BroadcastReporter);
  }

  function actArrangeAssertAllEvents() {
    factory.ALL_REPORTER_EVENTS.forEach((eventName) => {
      const eventData = eventName === 'wrapUp' ? undefined : eventName;
      (sut as any)[eventName](eventName);
      expect(rep1[eventName]).calledWith(eventData);
      expect(rep2[eventName]).calledWith(eventData);
    });
  }

  function captureTTY() {
    isTTY = process.stdout.isTTY;
  }

  function restoreTTY() {
    process.stdout.isTTY = isTTY;
  }

  function setTTY(val: boolean) {
    process.stdout.isTTY = val;
  }
});
