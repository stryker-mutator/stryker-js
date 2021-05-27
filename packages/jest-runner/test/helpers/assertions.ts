import { CompleteDryRunResult, FailedTestResult, SkippedTestResult, SuccessTestResult } from '@stryker-mutator/api/test-runner';
import { expect } from 'chai';

export type PartialTestResult = Partial<FailedTestResult> | Partial<SkippedTestResult> | Partial<SuccessTestResult>;

/**
 * Compares test results without comparing the time it took to run them
 */
export function expectTestResults(actualResult: CompleteDryRunResult, expectedTestResults: PartialTestResult[]): void {
  expect(actualResult.tests).to.have.length(expectedTestResults.length);
  expectedTestResults.forEach((expectedTestResult) => {
    const actualTestResult = actualResult.tests.find((test) => test.id === expectedTestResult.id);
    expect(actualTestResult).deep.contains(expectedTestResult);
  });
}
