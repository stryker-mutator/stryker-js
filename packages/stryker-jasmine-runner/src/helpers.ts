import { TestResult, TestStatus } from 'stryker-api/test_runner';

export function jasmineTestResultToStrykerTestResult(specResult: jasmine.CustomReporterResult, timeSpentMs: number): TestResult {
  let status = TestStatus.Failed;
  let failureMessages: string[] | undefined;
  if (specResult.status === 'disabled' || specResult.status === 'pending' || specResult.status === 'excluded') {
    status = TestStatus.Skipped;
  }
  if (!specResult.failedExpectations || specResult.failedExpectations.length === 0) {
    status = TestStatus.Success;
  } else {
    failureMessages = specResult.failedExpectations.map(failedExpectation => failedExpectation.message);
  }
  return {
    name: specResult.fullName,
    status,
    failureMessages,
    timeSpentMs
  };
}