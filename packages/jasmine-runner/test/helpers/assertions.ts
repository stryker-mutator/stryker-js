import { TestResult } from '@stryker-mutator/api/test_runner2';
import { expect } from 'chai';

export function expectTestResultsToEqual(actualTestResults: TestResult[], expectedResults: Array<Omit<TestResult, 'timeSpentMs'>>) {
  expect(actualTestResults).lengthOf(
    expectedResults.length,
    `Expected ${JSON.stringify(actualTestResults, null, 2)} to equal ${JSON.stringify(expectedResults, null, 2)}`
  );
  expectedResults.forEach((expectedResult) => {
    const actualTestResult = actualTestResults.find((testResult) => testResult.name === expectedResult.name);
    if (actualTestResult) {
      const actualWithoutTiming: Omit<TestResult, 'timeSpentMs'> = {
        name: actualTestResult.name,
        status: actualTestResult.status,
        failureMessage: actualTestResult.failureMessage,
      };
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
