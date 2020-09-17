import { CompleteDryRunResult, TestStatus, SkippedTestResult, FailedTestResult, SuccessTestResult } from '@stryker-mutator/api/test_runner';
import { expect } from 'chai';

export type TimelessTestResult =
  | Omit<SuccessTestResult, 'timeSpentMs'>
  | Omit<FailedTestResult, 'timeSpentMs'>
  | Omit<SkippedTestResult, 'timeSpentMs'>;

/**
 * Compares test results without comparing the time it took to run them
 */
export function expectTestResults(result: CompleteDryRunResult, expectedTestResults: TimelessTestResult[]) {
  const actualTestResults: TimelessTestResult[] = result.tests.map((test) => {
    const { timeSpentMs, ...timeless } = test;
    if (timeless.status === TestStatus.Failed) {
      timeless.failureMessage = timeless.failureMessage.split('\n')[0];
    }
    return timeless;
  });
  expect(actualTestResults).to.have.length(expectedTestResults.length);
  expectedTestResults.forEach((expectedTestResult) => {
    const actualTestResult = actualTestResults.find((test) => test.name === expectedTestResult.name);
    expect(actualTestResult).deep.eq(expectedTestResult);
  });
}
