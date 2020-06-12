import {
  TestResult,
  SuccessTestResult,
  FailedTestResult,
  SkippedTestResult,
  MutantRunStatus,
  MutantRunResult,
  RunStatus,
  DryRunResult,
  SurvivedMutantRunResult,
  ErrorDryRunResult,
  CompleteDryRunResult,
  KilledMutantRunResult,
} from '@stryker-mutator/api/test_runner2';
import { expect } from 'chai';

type TimelessTestResult = Omit<SuccessTestResult, 'timeSpentMs'> | Omit<FailedTestResult, 'timeSpentMs'> | Omit<SkippedTestResult, 'timeSpentMs'>;

export function expectTestResultsToEqual(actualTestResults: TestResult[], expectedResults: readonly TimelessTestResult[]) {
  expect(actualTestResults).lengthOf(
    expectedResults.length,
    `Expected ${JSON.stringify(actualTestResults, null, 2)} to equal ${JSON.stringify(expectedResults, null, 2)}`
  );
  expectedResults.forEach((expectedResult) => {
    const actualTestResult = actualTestResults.find((testResult) => testResult.name === expectedResult.name);
    if (actualTestResult) {
      const actualWithoutTiming = { ...actualTestResult };
      delete actualWithoutTiming.timeSpentMs;
      expect(actualWithoutTiming).deep.equal(expectedResult);
    } else {
      expect.fail(
        undefined,
        undefined,
        `Could not find test result "${expectedResult.name}" in ${JSON.stringify(actualTestResults.map((_) => _.name))}`
      );
    }
  });
}

export function expectKilled(result: MutantRunResult): asserts result is KilledMutantRunResult {
  expect(result.status).eq(MutantRunStatus.Killed);
}

export function expectCompleted(runResult: DryRunResult): asserts runResult is CompleteDryRunResult {
  expect(runResult.status).eq(RunStatus.Complete);
}
export function expectErrored(runResult: DryRunResult): asserts runResult is ErrorDryRunResult {
  expect(runResult.status).eq(RunStatus.Error);
}
export function expectSurvived(runResult: MutantRunResult): asserts runResult is SurvivedMutantRunResult {
  expect(runResult.status).eq(MutantRunStatus.Survived);
}
