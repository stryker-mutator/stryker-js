import { TestResult, SuccessTestResult, FailedTestResult, SkippedTestResult } from '@stryker-mutator/api/test_runner';
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
      const { timeSpentMs, ...actualWithoutTiming } = actualTestResult;
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
