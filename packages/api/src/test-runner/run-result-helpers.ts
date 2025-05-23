import { TestStatus } from './test-status.js';
import { DryRunResult, TimeoutDryRunResult } from './dry-run-result.js';
import { MutantRunResult, MutantRunStatus } from './mutant-run-result.js';
import { DryRunStatus } from './dry-run-status.js';
import { FailedTestResult } from './test-result.js';

export function determineHitLimitReached(
  hitCount: number | undefined,
  hitLimit: number | undefined,
): TimeoutDryRunResult | undefined {
  if (hitCount !== undefined && hitLimit !== undefined && hitCount > hitLimit) {
    return {
      status: DryRunStatus.Timeout,
      reason: `Hit limit reached (${hitCount}/${hitLimit})`,
    };
  }
  return;
}

export function toMutantRunResult(
  dryRunResult: DryRunResult,
  reportAllKillers = true,
): MutantRunResult {
  switch (dryRunResult.status) {
    case DryRunStatus.Complete: {
      const failedTests = dryRunResult.tests.filter<FailedTestResult>(
        (test): test is FailedTestResult => test.status === TestStatus.Failed,
      );
      const nrOfTests = dryRunResult.tests.filter(
        (test) => test.status !== TestStatus.Skipped,
      ).length;

      if (failedTests.length > 0) {
        return {
          status: MutantRunStatus.Killed,
          failureMessage: failedTests[0].failureMessage,
          killedBy: reportAllKillers
            ? failedTests.map<string>((test) => test.id)
            : [failedTests[0].id],
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
        reason: dryRunResult.reason,
      };
  }
}
