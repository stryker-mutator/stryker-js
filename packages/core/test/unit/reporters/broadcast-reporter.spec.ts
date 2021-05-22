import { PluginKind } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { coreTokens } from '../../../src/di';
import { PluginCreator } from '../../../src/di/plugin-creator';
import { BroadcastReporter } from '../../../src/reporters/broadcast-reporter';

describe(BroadcastReporter.name, () => {
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

  describe('with 2 reporters', () => {
    beforeEach(() => {
      sut = createSut();
    });

    it('should forward "onSourceFileRead"', () => {
      actAssertShouldForward('onSourceFileRead', factory.sourceFile());
    });
    it('should forward "onAllSourceFilesRead"', () => {
      actAssertShouldForward('onAllSourceFilesRead', [factory.sourceFile()]);
    });
    it('should forward "onAllMutantsMatchedWithTests"', () => {
      actAssertShouldForward('onAllMutantsMatchedWithTests', [factory.mutantTestCoverage()]);
    });
    it('should forward "onMutantTested"', () => {
      actAssertShouldForward('onMutantTested', factory.mutantResult());
    });
    it('should forward "onAllMutantsTested"', () => {
      actAssertShouldForward('onAllMutantsTested', [factory.mutantResult()]);
    });
    it('should forward "onMutationTestReportReady"', () => {
      actAssertShouldForward('onMutationTestReportReady', factory.mutationTestReportSchemaMutationTestResult(), factory.mutationTestMetricsResult());
    });
    it('should forward "wrapUp"', () => {
      actAssertShouldForward('wrapUp');
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

      it('should still broadcast "onSourceFileRead"', () => {
        actAssertShouldForward('onSourceFileRead', factory.sourceFile());
      });
      it('should still broadcast "onAllSourceFilesRead"', () => {
        actAssertShouldForward('onAllSourceFilesRead', [factory.sourceFile()]);
      });
      it('should still broadcast "onAllMutantsMatchedWithTests"', () => {
        actAssertShouldForward('onAllMutantsMatchedWithTests', [factory.mutantTestCoverage()]);
      });
      it('should still broadcast "onMutantTested"', () => {
        actAssertShouldForward('onMutantTested', factory.mutantResult());
      });
      it('should still broadcast "onAllMutantsTested"', () => {
        actAssertShouldForward('onAllMutantsTested', [factory.mutantResult()]);
      });
      it('should still broadcast "onMutationTestReportReady"', () => {
        actAssertShouldForward(
          'onMutationTestReportReady',
          factory.mutationTestReportSchemaMutationTestResult(),
          factory.mutationTestMetricsResult()
        );
      });
      it('should still broadcast "wrapUp"', () => {
        actAssertShouldForward('wrapUp');
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
      .provideValue(coreTokens.pluginCreatorReporter, pluginCreatorMock as unknown as PluginCreator<PluginKind.Reporter>)
      .injectClass(BroadcastReporter);
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

  function actAssertShouldForward<TMethod extends keyof Reporter>(method: TMethod, ...input: Parameters<Required<Reporter>[TMethod]>) {
    (sut[method] as (...args: Parameters<Required<Reporter>[TMethod]>) => Promise<void> | void)(...input);
    expect(rep1[method]).calledWithExactly(...input);
    expect(rep2[method]).calledWithExactly(...input);
  }
});
