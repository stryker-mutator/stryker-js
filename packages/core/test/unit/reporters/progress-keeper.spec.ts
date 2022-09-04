import { expect } from 'chai';
import { factory } from '@stryker-mutator/test-helpers';
import { MutantStatus } from 'mutation-testing-report-schema';

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

  it("should not count mutants that didn't run", () => {
    // Arrange
    sut.onDryRunCompleted(factory.dryRunCompletedEvent());
    sut.onMutationTestingPlanReady(
      factory.mutationTestingPlanReadyEvent({
        mutantPlans: [
          factory.mutantEarlyResultPlan({ mutant: factory.ignoredMutantTestCoverage({ id: '1' }) }),
          factory.mutantRunPlan({ mutant: factory.mutantTestCoverage({ id: '2' }) }),
        ],
      })
    );

    // Act
    sut.onMutantTested(factory.mutantResult({ id: '1', status: MutantStatus.Survived }));

    // Assert
    expect(sut.progressForTesting.survived).eq(0);
  });

  // Other tests still need to be moved from progress-reporter.spec.ts some day
});
