import { PluginKind } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { factory, TEST_INJECTOR } from '@stryker-mutator/test-helpers';
import { ALL_REPORTER_EVENTS, SCORE_RESULT } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { coreTokens } from '../../../src/di';
import { PluginCreator } from '../../../src/di/PluginCreator';
import BroadcastReporter from '../../../src/reporters/BroadcastReporter';

describe('BroadcastReporter', () => {

  let sut: BroadcastReporter;
  let rep1: sinon.SinonStubbedInstance<Required<Reporter>>;
  let rep2: sinon.SinonStubbedInstance<Required<Reporter>>;
  let isTTY: boolean;
  let pluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator<PluginKind.Reporter>>;

  beforeEach(() => {
    captureTTY();
    TEST_INJECTOR.options.reporters = ['rep1', 'rep2'];
    rep1 = factory.reporter('rep1');
    rep2 = factory.reporter('rep2');
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    pluginCreatorMock.create
      .withArgs('rep1').returns(rep1)
      .withArgs('rep2').returns(rep2);
  });

  afterEach(() => {
    restoreTTY();
  });

  describe('when constructed', () => {
    it('should create "progress-append-only" instead of "progress" reporter if process.stdout is not a tty', () => {
      // Arrange
      setTTY(false);
      const expectedReporter = factory.reporter('progress-append-only');
      TEST_INJECTOR.options.reporters = ['progress'];
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
      TEST_INJECTOR.options.reporters = ['progress', 'rep2'];
      const progress = factory.reporter('progress');
      pluginCreatorMock.create.withArgs('progress').returns(progress);

      // Act
      sut = createSut();

      // Assert
      expect(sut.reporters).deep.eq({
        progress,
        rep2
      });
    });

    it('should warn if there is no reporter', () => {
      TEST_INJECTOR.options.reporters = [];
      sut = createSut();
      expect(TEST_INJECTOR.logger.warn).calledWith(sinon.match('No reporter configured'));
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
      let wrapUpResolveFn: Function;
      let wrapUpResolveFn2: Function;
      let wrapUpRejectFn: Function;
      let result: Promise<void>;
      let isResolved: boolean;

      beforeEach(() => {
        isResolved = false;
        rep1.wrapUp.returns(new Promise<void>((resolve, reject) => {
          wrapUpResolveFn = resolve;
          wrapUpRejectFn = reject;
        }));
        rep2.wrapUp.returns(new Promise<void>(resolve => wrapUpResolveFn2 = resolve));
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
          expect(TEST_INJECTOR.logger.error).calledWith(`An error occurred during 'wrapUp' on reporter 'rep1'.`, actualError);
        });
      });
    });

    describe('with one faulty reporter', () => {
      let actualError: Error;

      beforeEach(() => {
        actualError = new Error('some error');
        ALL_REPORTER_EVENTS.forEach(eventName => rep1[eventName].throws(actualError));
      });

      it('should still broadcast to other reporters', () => {
        actArrangeAssertAllEvents();
      });

      it('should log each error', () => {
        ALL_REPORTER_EVENTS.forEach(eventName => {
          (sut as any)[eventName]();
          expect(TEST_INJECTOR.logger.error).to.have.been.calledWith(`An error occurred during '${eventName}' on reporter 'rep1'.`, actualError);
        });
      });
    });

    describe('with a deprecated reporter event', () => {
      beforeEach(() => {
        sut = createSut();
      });

      it('should log a warning for reporters that implement the onScoreCalculated event', () => {
        rep1.onScoreCalculated.returns(() => { });
        (rep2 as any).onScoreCalculated = undefined;

        sut.onScoreCalculated(SCORE_RESULT());

        expect(TEST_INJECTOR.logger.warn).to.have.been.calledWith(`DEPRECATED: The reporter 'rep1' uses 'onScoreCalculated' which is deprecated. Please use 'onMutationTestReportReady' and calculate the score as an alternative.`);
        expect(TEST_INJECTOR.logger.warn).to.not.have.been.calledWithMatch('rep2');
      });
    });
  });

  function createSut() {
    return TEST_INJECTOR.injector
      .provideValue(coreTokens.PluginCreatorReporter, pluginCreatorMock as unknown as PluginCreator<PluginKind.Reporter>)
      .injectClass(BroadcastReporter);
  }

  function actArrangeAssertAllEvents() {
    ALL_REPORTER_EVENTS.forEach(eventName => {
      const eventData = eventName === 'wrapUp' ? undefined : eventName;
      (sut as any)[eventName](eventName);
      expect(rep1[eventName]).calledWith(eventData);
      expect(rep2[eventName]).calledWith(eventData);
    });
  }

  function captureTTY() {
    isTTY = (process.stdout as any).isTTY;
  }

  function restoreTTY() {
    (process.stdout as any).isTTY = isTTY;
  }

  function setTTY(val: boolean) {
    (process.stdout as any).isTTY = val;
  }
});
