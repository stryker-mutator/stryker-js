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
      const shouldIncludeExecutedTests =
        process.env.STRYKER_MUTATION_TEST_TIMINGS === '1';
      const executedTests = shouldIncludeExecutedTests
        ? dryRunResult.tests
            .filter((test) => test.status !== TestStatus.Skipped)
            .map((test) => ({
              id: test.id,
              name: test.name,
              status: test.status,
              timeSpentMs: test.timeSpentMs,
              fileName: test.fileName,
            }))
        : undefined;
      const maxExecutedTests = Number.parseInt(
        process.env.STRYKER_MUTATION_TEST_TIMINGS_MAX_TESTS ?? '',
        10,
      );
      const boundedExecutedTests =
        executedTests &&
        Number.isFinite(maxExecutedTests) &&
        maxExecutedTests > 0
          ? executedTests.slice(0, maxExecutedTests)
          : executedTests;

      if (failedTests.length > 0) {
        const killedResult = {
          status: MutantRunStatus.Killed as const,
          failureMessage: failedTests[0].failureMessage,
          killedBy: reportAllKillers
            ? failedTests.map<string>((test) => test.id)
            : [failedTests[0].id],
          nrOfTests,
        };

        return boundedExecutedTests
          ? { ...killedResult, executedTests: boundedExecutedTests }
          : killedResult;
      } else {
        const survivedResult = {
          status: MutantRunStatus.Survived as const,
          nrOfTests,
        };

        return boundedExecutedTests
          ? { ...survivedResult, executedTests: boundedExecutedTests }
          : survivedResult;
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
