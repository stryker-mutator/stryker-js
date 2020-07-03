import { TestStatus } from './TestStatus';
import { DryRunResult } from './DryRunResult';
import { MutantRunResult } from './MutantRunResult';
import { DryRunStatus } from './DryRunStatus';
import { MutantRunStatus } from './MutantRunResult';
import { FailedTestResult } from './TestResult';

export function toMutantRunResult(dryRunResult: DryRunResult): MutantRunResult {
  switch (dryRunResult.status) {
    case DryRunStatus.Complete: {
      const killedBy = dryRunResult.tests.find<FailedTestResult>((test): test is FailedTestResult => test.status === TestStatus.Failed);
      if (killedBy) {
        return {
          status: MutantRunStatus.Killed,
          failureMessage: killedBy.failureMessage,
          killedBy: killedBy.id,
        };
      } else {
        return {
          status: MutantRunStatus.Survived,
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
