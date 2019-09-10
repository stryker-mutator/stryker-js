import { TestResult, TestStatus } from '@stryker-mutator/api/test_runner';
import { expect } from 'chai';

export function expectTestResultsToEqual(actualTestResults: TestResult[], expectedResults: ReadonlyArray<{ name: string, status: TestStatus, failureMessages: string[] | undefined }>) {
  expect(actualTestResults).lengthOf(expectedResults.length, `Expected ${JSON.stringify(actualTestResults, null, 2)} to equal ${JSON.stringify(expectedResults, null, 2)}`);
  expectedResults.forEach(expectedResult => {
    const actualTestResult = actualTestResults.find(testResult => testResult.name === expectedResult.name);
    if (actualTestResult) {
      expect({ name: actualTestResult.name, status: actualTestResult.status, failureMessages: actualTestResult.failureMessages })
        .deep.equal(expectedResult);
    } else {
      expect.fail(undefined, undefined, `Could not find test result "${expectedResult.name}" in ${JSON.stringify(actualTestResults.map(_ => _.name))}`);
    }
  });
}
