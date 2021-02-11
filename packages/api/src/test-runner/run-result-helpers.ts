import { TestStatus } from './test-status';
import { DryRunResult } from './dry-run-result';
import { MutantRunResult, MutantRunStatus } from './mutant-run-result';
import { DryRunStatus } from './dry-run-status';
import { FailedTestResult } from './test-result';

export function toMutantRunResult(dryRunResult: DryRunResult): MutantRunResult {
  switch (dryRunResult.status) {
    case DryRunStatus.Complete: {
      const killedBy = dryRunResult.tests.find<FailedTestResult>((test): test is FailedTestResult => test.status === TestStatus.Failed);
      const nrOfTests = dryRunResult.tests.filter((test) => test.status !== TestStatus.Skipped).length;
      if (killedBy) {
        return {
          status: MutantRunStatus.Killed,
          failureMessage: killedBy.failureMessage,
          killedBy: killedBy.id,
          nrOfTests,
        };
      } else {
        return {
          status: MutantRunStatus.Survived,
          nrOfTests,
        };
      }
    }
    case DryRunStatus.Error:
      return {
        status: MutantRunStatus.Error,
        errorMessage: dryRunResult.errorMessage,
      };
    case DryRunStatus.Timeout:
      return {
        status: MutantRunStatus.Timeout,
      };
  }
}
