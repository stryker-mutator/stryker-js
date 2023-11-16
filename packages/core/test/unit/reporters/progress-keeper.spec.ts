import { expect } from 'chai';
import { factory } from '@stryker-mutator/test-helpers';

import { DryRunCompletedEvent, MutationTestingPlanReadyEvent } from '@stryker-mutator/api/report';

import { ProgressKeeper } from '../../../src/reporters/progress-keeper.js';

class TestProgressKeeper extends ProgressKeeper {
  public get progressForTesting() {
    return this.progress;
  }
}

describe(ProgressKeeper.name, () => {
  let sut: TestProgressKeeper;

  beforeEach(() => {
    sut = new TestProgressKeeper();
  });

  describe('onMutationTestingPlanReady()', () => {
    it("should not count mutants that didn't run", () => {
      // Arrange
      sut.onDryRunCompleted(factory.dryRunCompletedEvent());
      sut.onMutationTestingPlanReady(
        factory.mutationTestingPlanReadyEvent({
          mutantPlans: [
            factory.mutantEarlyResultPlan({ mutant: factory.ignoredMutantTestCoverage({ id: '1' }) }),
            factory.mutantRunPlan({ mutant: factory.mutantTestCoverage({ id: '2' }) }),
          ],
        }),
      );

      // Act
      sut.onMutantTested(factory.mutantResult({ id: '1', status: 'Survived' }));

      // Assert
      expect(sut.progressForTesting.survived).eq(0);
    });

    function arrangeEvents({
      netTimeMutant1,
      netTimeMutant2,
      netTimeMutant3,
      overhead,
      reloadEnvironment,
    }: {
      netTimeMutant1: number;
      netTimeMutant2: number;
      netTimeMutant3: number;
      overhead: number;
      reloadEnvironment: boolean;
    }): { dryRunCompleted: DryRunCompletedEvent; mutationTestingPlanReady: MutationTestingPlanReadyEvent } {
      const test1 = '1';
      const test2 = '2';
      return {
        dryRunCompleted: factory.dryRunCompletedEvent({
          result: factory.completeDryRunResult({
            tests: [factory.testResult({ id: test1, timeSpentMs: 10 }), factory.testResult({ id: test2, timeSpentMs: 5 })],
          }),
          timing: factory.runTiming({ net: 15, overhead }),
          capabilities: factory.testRunnerCapabilities({ reloadEnvironment }),
        }),
        mutationTestingPlanReady: factory.mutationTestingPlanReadyEvent({
          mutantPlans: [
            // Ignored mutant
            factory.mutantEarlyResultPlan({ mutant: factory.ignoredMutantTestCoverage({ id: '1' }) }),
            // Run test 1, takes 10ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '2' }),
              runOptions: factory.mutantRunOptions({ testFilter: [test1] }),
              netTime: netTimeMutant1,
            }),
            // Run test 2, takes 5ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '3' }),
              runOptions: factory.mutantRunOptions({ testFilter: [test2] }),
              netTime: netTimeMutant2,
            }),
            // Run all tests, takes 115ms
            factory.mutantRunPlan({
              mutant: factory.mutantTestCoverage({ id: '4' }),
              runOptions: factory.mutantRunOptions({ testFilter: undefined, reloadEnvironment: true }),
              netTime: netTimeMutant3,
            }),
          ],
        }),
      };
    }

    it('should calculate the correct total', () => {
      const { dryRunCompleted, mutationTestingPlanReady } = arrangeEvents({
        netTimeMutant1: 10,
        netTimeMutant2: 5,
        netTimeMutant3: 15,
        overhead: 100,
        reloadEnvironment: false,
      });
      sut.onDryRunCompleted(dryRunCompleted);
      sut.onMutationTestingPlanReady(mutationTestingPlanReady);

      expect(sut.progressForTesting.total).eq(130 /*115 + 5 + 10*/);
    });

    it('should not take overhead into account when the test runner is capable to reload the environment', () => {
      const { dryRunCompleted, mutationTestingPlanReady } = arrangeEvents({
        netTimeMutant1: 10,
        netTimeMutant2: 5,
        netTimeMutant3: 15,
        overhead: 100,
        reloadEnvironment: true,
      });
      sut.onDryRunCompleted(dryRunCompleted);
      sut.onMutationTestingPlanReady(mutationTestingPlanReady);

      expect(sut.progressForTesting.total).eq(30 /*15 + 5 + 10*/);
    });
  });

  // Other tests still need to be moved from progress-reporter.spec.ts some day
});
