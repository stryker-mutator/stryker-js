import { TestResult } from '@stryker-mutator/api/test_runner2';
import { TestStatus } from '@stryker-mutator/api/test_runner';

import JasmineConstructor = require('jasmine');

export function toStrykerTestResult(specResult: jasmine.CustomReporterResult, timeSpentMs: number): TestResult {
  let status = TestStatus.Failed;
  let failureMessage: string | undefined;
  if (specResult.status === 'disabled' || specResult.status === 'pending' || specResult.status === 'excluded') {
    status = TestStatus.Skipped;
  } else if (!specResult.failedExpectations || specResult.failedExpectations.length === 0) {
    status = TestStatus.Success;
  } else {
    failureMessage = specResult.failedExpectations.map((failedExpectation) => failedExpectation.message).join(',');
  }
  return {
    failureMessage,
    name: specResult.fullName,
    status,
    timeSpentMs,
  };
}

export const Jasmine = JasmineConstructor;
