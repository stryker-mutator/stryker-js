import { TestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import jasmine from 'jasmine';

export const helpers = {
  toStrykerTestResult(specResult: jasmine.SpecResult, timeSpentMs: number): TestResult {
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
  },
  createJasmine(options: jasmine.JasmineOptions): jasmine {
    return new jasmine(options);
  },
};
