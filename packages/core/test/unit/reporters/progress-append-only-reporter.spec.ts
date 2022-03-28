import os from 'os';

import { expect } from 'chai';
import sinon from 'sinon';
import { factory } from '@stryker-mutator/test-helpers';
import { PlanKind } from '@stryker-mutator/api/core';

import { ProgressAppendOnlyReporter } from '../../../src/reporters/progress-append-only-reporter.js';

const ONE_SECOND = 1000;
const TEN_SECONDS = ONE_SECOND * 10;
const HUNDRED_SECONDS = ONE_SECOND * 100;

describe(ProgressAppendOnlyReporter.name, () => {
  let sut: ProgressAppendOnlyReporter;

  beforeEach(() => {
    sut = new ProgressAppendOnlyReporter();
    sinon.useFakeTimers();
    sinon.stub(process.stdout, 'write');
  });

  describe('onMutationTestingPlanReady() with 4 mutants to test', () => {
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
            factory.mutantEarlyResultPlan({ mutant: factory.ignoredMutantTestCoverage({ id: '1' }), plan: PlanKind.EarlyResult }),
            // Run test 1, takes 10ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '2' }),
              plan: PlanKind.Run,
              runOptions: factory.mutantRunOptions({ testFilter: ['1'] }),
            }),
            // Run test 2, takes 5ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '3' }),
              plan: PlanKind.Run,
              runOptions: factory.mutantRunOptions({ testFilter: ['2'] }),
            }),
            // Run all tests, takes 115ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '4' }),
              plan: PlanKind.Run,
              runOptions: factory.mutantRunOptions({ testFilter: undefined, reloadEnvironment: true }),
            }),
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '5' }),
              plan: PlanKind.Run,
              runOptions: factory.mutantRunOptions({ testFilter: ['1', '2'], reloadEnvironment: false }),
            }),
          ],
        })
      );
    });

    it('should not show show progress directly', () => {
      expect(process.stdout.write).to.not.have.been.called;
    });

    it('should log correct info after ten seconds without completed tests', () => {
      sinon.clock.tick(TEN_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(
        `Mutation testing 0% (elapsed: <1m, remaining: n/a) 0/4 tested (0 survived, 0 timed out)${os.EOL}`
      );
    });

    it('should ignore ignored mutants', () => {
      sut.onMutantTested(factory.killedMutantResult({ id: '1' }));
      sinon.clock.tick(TEN_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(
        `Mutation testing 0% (elapsed: <1m, remaining: n/a) 0/4 tested (0 survived, 0 timed out)${os.EOL}`
      );
    });

    it('should log correct when a runtime mutant is killed', () => {
      // 15/145*100 = 10.3
      sut.onMutantTested(factory.killedMutantResult({ id: '5' }));
      expect(process.stdout.write).to.not.have.been.called;
      sinon.clock.tick(TEN_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(
        `Mutation testing 10% (elapsed: <1m, remaining: ~1m) 1/4 tested (0 survived, 0 timed out)${os.EOL}`
      );
    });

    it('should log correct percentage when a static mutant is killed', () => {
      // 115/145*100 = 79
      sut.onMutantTested(factory.killedMutantResult({ id: '4' }));
      expect(process.stdout.write).to.not.have.been.called;
      sinon.clock.tick(TEN_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(
        `Mutation testing 79% (elapsed: <1m, remaining: <1m) 1/4 tested (0 survived, 0 timed out)${os.EOL}`
      );
    });

    it('should log correct info after a hundred seconds with 1 completed test', () => {
      // 5/145*100 = 3.4
      sut.onMutantTested(factory.killedMutantResult({ id: '3' }));
      expect(process.stdout.write).to.not.have.been.called;
      sinon.clock.tick(HUNDRED_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(
        `Mutation testing 3% (elapsed: ~1m, remaining: ~46m) 1/4 tested (0 survived, 0 timed out)${os.EOL}`
      );
    });

    it('should log timed out and survived mutants', () => {
      sinon.clock.tick(ONE_SECOND);
      sut.onMutantTested(factory.survivedMutantResult({ id: '3' }));
      sinon.clock.tick(ONE_SECOND);
      sut.onMutantTested(factory.timeoutMutantResult({ id: '4' }));
      sinon.clock.tick(TEN_SECONDS);
      expect(process.stdout.write).to.have.been.calledWith(
        `Mutation testing 82% (elapsed: <1m, remaining: <1m) 2/4 tested (1 survived, 1 timed out)${os.EOL}`
      );
    });
  });
});
