import { expect } from 'chai';
import { RunResult, TestStatus } from '@stryker-mutator/api/test_runner';

export function expectTestResults(result: RunResult, expectedTestResults: { name: string, status: TestStatus }[]) {
  const actualTestResults = result.tests.map(test => ({ name: test.name, status: test.status }));
  expect(actualTestResults).to.have.length(expectedTestResults.length);
  expectedTestResults.forEach(expectedTestResult => {
    const actualTestResult = actualTestResults.find(test => test.name === expectedTestResult.name);
    expect(actualTestResult).deep.eq(expectedTestResult);
  });
}
