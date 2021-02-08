import { TestResult, TestStatus } from '@stryker-mutator/api/test-runner';

import JasmineConstructor from 'jasmine';

export function toStrykerTestResult(specResult: jasmine.CustomReporterResult, timeSpentMs: number): TestResult {
  const baseResult = {
    id: specResult.id.toString(),
    name: specResult.fullName,
    timeSpentMs,
  };
  if (specResult.status === 'disabled' || specResult.status === 'pending' || specResult.status === 'excluded') {
    return {
      ...baseResult,
      status: TestStatus.Skipped,
    };
  } else if (!specResult.failedExpectations || specResult.failedExpectations.length === 0) {
    return {
      ...baseResult,
      status: TestStatus.Success,
    };
  } else {
    return {
      ...baseResult,
      status: TestStatus.Failed,
      failureMessage: specResult.failedExpectations.map((failedExpectation) => failedExpectation.message).join(','),
    };
  }
}

export const Jasmine = JasmineConstructor;
