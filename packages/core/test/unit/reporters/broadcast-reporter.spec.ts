import { PluginKind } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { coreTokens, PluginCreator } from '../../../src/di/index.js';
import { BroadcastReporter } from '../../../src/reporters/broadcast-reporter.js';

describe(BroadcastReporter.name, () => {
  let sut: BroadcastReporter;
  let rep1: sinon.SinonStubbedInstance<Required<Reporter>>;
  let rep2: sinon.SinonStubbedInstance<Required<Reporter>>;
  let isTTY: boolean;
  let pluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator>;

  beforeEach(() => {
    captureTTY();
    testInjector.options.reporters = ['rep1', 'rep2'];
    rep1 = factory.reporter('rep1');
    rep2 = factory.reporter('rep2');
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    pluginCreatorMock.create.withArgs(PluginKind.Reporter, 'rep1').returns(rep1).withArgs(PluginKind.Reporter, 'rep2').returns(rep2);
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
      sinon.assert.calledWith(pluginCreatorMock.create, PluginKind.Reporter, 'progress-append-only');
    });

    it('should create the correct reporters', () => {
      // Arrange
      setTTY(true);
      testInjector.options.reporters = ['progress', 'rep2'];
      const progress = factory.reporter('progress');
      pluginCreatorMock.create.withArgs(PluginKind.Reporter, 'progress').returns(progress);

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

  describe('with 2 reporters', () => {
    beforeEach(() => {
      sut = createSut();
    });

    it('should forward "onDryRunCompleted"', async () => {
      await actAssertShouldForward('onDryRunCompleted', factory.dryRunCompletedEvent());
    });
    it('should forward "onMutationTestingPlanReady"', async () => {
      await actAssertShouldForward('onMutationTestingPlanReady', factory.mutationTestingPlanReadyEvent());
    });
    it('should forward "onMutantTested"', async () => {
      await actAssertShouldForward('onMutantTested', factory.mutantResult());
    });
    it('should forward "onMutationTestReportReady"', async () => {
      await actAssertShouldForward(
        'onMutationTestReportReady',
        factory.mutationTestReportSchemaMutationTestResult(),
        factory.mutationTestMetricsResult(),
      );
    });
    it('should forward "wrapUp"', async () => {
      await actAssertShouldForward('wrapUp');
    });

    describe('when "wrapUp" returns promises', () => {
      let wrapUpResolveFn: (value?: PromiseLike<void> | void) => void;
      let wrapUpResolveFn2: (value?: PromiseLike<void> | void) => void;
      let wrapUpRejectFn: (reason?: any) => void;
      let result: Promise<void>;
      let isResolved: boolean;

      beforeEach(() => {
        isResolved = false;
        rep1.wrapUp.returns(
          new Promise<void>((resolve, reject) => {
            wrapUpResolveFn = resolve;
            wrapUpRejectFn = reject;
          }),
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

      it('should still broadcast "onDryRunCompleted"', async () => {
        await actAssertShouldForward('onDryRunCompleted', factory.dryRunCompletedEvent());
      });
      it('should still broadcast "onMutationTestingPlanReady"', async () => {
        await actAssertShouldForward('onMutationTestingPlanReady', factory.mutationTestingPlanReadyEvent());
      });
      it('should still broadcast "onMutantTested"', async () => {
        await actAssertShouldForward('onMutantTested', factory.mutantResult());
      });
      it('should still broadcast "onMutationTestReportReady"', async () => {
        await actAssertShouldForward(
          'onMutationTestReportReady',
          factory.mutationTestReportSchemaMutationTestResult(),
          factory.mutationTestMetricsResult(),
        );
      });
      it('should still broadcast "wrapUp"', async () => {
        await actAssertShouldForward('wrapUp');
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
    return testInjector.injector.provideValue(coreTokens.pluginCreator, pluginCreatorMock).injectClass(BroadcastReporter);
  }

  function captureTTY() {
    ({ isTTY } = process.stdout);
  }

  function restoreTTY() {
    process.stdout.isTTY = isTTY;
  }

  function setTTY(val: boolean) {
    process.stdout.isTTY = val;
  }

  async function actAssertShouldForward<TMethod extends keyof Reporter>(method: TMethod, ...input: Parameters<Required<Reporter>[TMethod]>) {
    await (sut[method] as (...args: Parameters<Required<Reporter>[TMethod]>) => Promise<void> | void)(...input);
    expect(rep1[method]).calledWithExactly(...input);
    expect(rep2[method]).calledWithExactly(...input);
  }
});
