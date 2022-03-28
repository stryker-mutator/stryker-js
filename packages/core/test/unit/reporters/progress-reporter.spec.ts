import { expect } from 'chai';
import sinon from 'sinon';
import ProgressBar from 'progress';
import { factory } from '@stryker-mutator/test-helpers';

import { progressBarWrapper } from '../../../src/reporters/progress-bar.js';
import { ProgressBarReporter } from '../../../src/reporters/progress-reporter.js';
import { Mock, mock } from '../../helpers/producers.js';

const SECOND = 1000;
const TEN_SECONDS = SECOND * 10;
const HUNDRED_SECONDS = SECOND * 100;
const TEN_THOUSAND_SECONDS = SECOND * 10000;
const ONE_HOUR = SECOND * 3600;

describe(ProgressBarReporter.name, () => {
  let sut: ProgressBarReporter;
  let progressBar: Mock<ProgressBar>;
  let progressBarConstructorStub: sinon.SinonStub;
  const progressBarContent =
    'Mutation testing  [:bar] :percent (elapsed: :et, remaining: :etc) :tested/:mutants Mutants tested (:survived survived, :timedOut timed out)';

  beforeEach(() => {
    sinon.useFakeTimers();
    sut = new ProgressBarReporter();
    progressBar = mock(ProgressBar);
    progressBarConstructorStub = sinon.stub(progressBarWrapper, 'ProgressBar');
    progressBarConstructorStub.returns(progressBar);
  });

  describe('onMutationTestingPlanReady()', () => {
    it('should calculate the correct total', () => {
      sut.onDryRunCompleted(
        factory.dryRunCompletedEvent({
          result: factory.completeDryRunResult({
            tests: [factory.testResult({ id: '1', timeSpentMs: 10 }), factory.testResult({ id: '2', timeSpentMs: 5 })],
          }),
          timing: factory.runTiming({ net: 15, overhead: 100 }),
        })
      );
      sut.onMutationTestingPlanReady(
        factory.mutationTestingPlanReadyEvent({
          mutantPlans: [
            // Ignored mutant
            factory.mutantEarlyResultPlan({ mutant: factory.ignoredMutantTestCoverage({ id: '1' }) }),
            // Run test 1, takes 10ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '2' }),
              runOptions: factory.mutantRunOptions({ testFilter: ['1'] }),
            }),
            // Run test 2, takes 5ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '3' }),
              runOptions: factory.mutantRunOptions({ testFilter: ['2'] }),
            }),
            // Run all tests, takes 115ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '4' }),
              runOptions: factory.mutantRunOptions({ testFilter: undefined, reloadEnvironment: true }),
            }),
          ],
        })
      );

      expect(progressBarConstructorStub).calledWithMatch(progressBarContent, { total: 115 + 5 + 10 });
    });
  });

  describe('onMutantTested()', () => {
    let progressBarTickTokens: any;

    beforeEach(() => {
      sut.onDryRunCompleted(
        factory.dryRunCompletedEvent({
          result: factory.completeDryRunResult({
            tests: [factory.testResult({ id: '1', timeSpentMs: 10 }), factory.testResult({ id: '2', timeSpentMs: 5 })],
          }),
          timing: factory.runTiming({ net: 15, overhead: 100 }),
        })
      );
      sut.onMutationTestingPlanReady(
        factory.mutationTestingPlanReadyEvent({
          mutantPlans: [
            // Ignored mutant
            factory.mutantEarlyResultPlan({ mutant: factory.ignoredMutantTestCoverage({ id: '1' }) }),
            // Run test 1, takes 10ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '2' }),
              runOptions: factory.mutantRunOptions({ testFilter: ['1'] }),
            }),
            // Run test 2, takes 5ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '3' }),
              runOptions: factory.mutantRunOptions({ testFilter: ['2'] }),
            }),
            // Run all tests, takes 115ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '4' }),
              runOptions: factory.mutantRunOptions({ testFilter: undefined, reloadEnvironment: true }),
            }),
          ],
        })
      );
    });

    it('should tick the ProgressBar with 1 tested mutant, 0 survived when status is not "Survived"', () => {
      sut.onMutantTested(factory.killedMutantResult({ id: '2' }));
      progressBarTickTokens = { total: 130, tested: 1, survived: 0 };
      sinon.assert.calledWithMatch(progressBar.tick, 10, progressBarTickTokens);
    });

    it('should not tick the ProgressBar the result did not yield any ticks', () => {
      progressBar.total = 130;
      sut.onMutantTested(factory.ignoredMutantResult({ id: '1' })); // ignored mutant
      progressBarTickTokens = { total: 130, tested: 0, survived: 0 };
      sinon.assert.notCalled(progressBar.tick);
      sinon.assert.calledWithMatch(progressBar.render, progressBarTickTokens);
    });

    it('should tick the ProgressBar with 1 survived mutant when status is "Survived"', () => {
      sut.onMutantTested(factory.survivedMutantResult({ id: '4', static: true }));
      progressBarTickTokens = { total: 130, tested: 1, survived: 1 };
      sinon.assert.calledWithMatch(progressBar.tick, 115, progressBarTickTokens);
    });
  });

  describe('ProgressBar estimated time for 3 mutants', () => {
    beforeEach(() => {
      sut.onDryRunCompleted(
        factory.dryRunCompletedEvent({
          result: factory.completeDryRunResult({
            tests: [factory.testResult({ id: '1', timeSpentMs: 10 }), factory.testResult({ id: '2', timeSpentMs: 5 })],
          }),
          timing: factory.runTiming({ net: 15, overhead: 100 }),
        })
      );
      sut.onMutationTestingPlanReady(
        factory.mutationTestingPlanReadyEvent({
          mutantPlans: [
            // Ignored mutant
            factory.mutantEarlyResultPlan({ mutant: factory.ignoredMutantTestCoverage({ id: '1' }) }),
            // Run test 1, takes 10ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '2' }),
              runOptions: factory.mutantRunOptions({ testFilter: ['1'] }),
            }),
            // Run test 2, takes 5ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '3' }),
              runOptions: factory.mutantRunOptions({ testFilter: ['2'] }),
            }),
            // Run all tests, takes 115ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '4' }),
              runOptions: factory.mutantRunOptions({ testFilter: undefined, reloadEnvironment: true }),
            }),
          ],
        })
      );
    });

    it('should show correct time info after ten seconds and 3.8% tested', () => {
      sinon.clock.tick(TEN_SECONDS);

      sut.onMutantTested(factory.mutantResult({ id: '3' }));

      sinon.assert.calledWithMatch(progressBar.tick, 5, { et: '<1m', etc: '~4m' });
    });

    it('should show correct time info after a hundred seconds and 7% tested', () => {
      sinon.clock.tick(HUNDRED_SECONDS);

      sut.onMutantTested(factory.mutantResult({ id: '2' }));

      sinon.assert.calledWithMatch(progressBar.tick, 10, { et: '~1m', etc: '~20m' });
    });

    it('should show correct time info after ten thousand seconds and 88%', () => {
      sinon.clock.tick(TEN_THOUSAND_SECONDS);

      sut.onMutantTested(factory.mutantResult({ id: '4' }));

      sinon.assert.calledWithMatch(progressBar.tick, 115, { et: '~2h 46m', etc: '~21m' });
    });

    it('should show correct time info after an hour and 11% tested', () => {
      sinon.clock.tick(ONE_HOUR);

      sut.onMutantTested(factory.mutantResult({ id: '2' }));
      sut.onMutantTested(factory.mutantResult({ id: '3' }));

      sinon.assert.calledWithMatch(progressBar.tick, 10, { et: '~1h 0m', etc: '~12h 0m' });
      sinon.assert.calledWithMatch(progressBar.tick, 5, { et: '~1h 0m', etc: '~7h 40m' });
    });
  });
});
