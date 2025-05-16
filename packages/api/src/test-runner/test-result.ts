import { Position } from '../core/index.js';

import { TestStatus } from './test-status.js';

/**
 * Indicates the result of a single test
 */
export interface BaseTestResult {
  /**
   * The id of this test. Can be the name if the test runner doesn't have an 'id'
   */
  id: string;
  /**
   * The full human readable name of the test
   */
  name: string;
  /**
   * The time it took to run the test
   */
  timeSpentMs: number;

  /**
   * The file where this test was defined in (if known)
   */
  fileName?: string;

  /**
   * The position of the test (if known)
   */
  startPosition?: Position;
}

export interface FailedTestResult extends BaseTestResult {
  status: TestStatus.Failed;
  failureMessage: string;
}

export interface SkippedTestResult extends BaseTestResult {
  status: TestStatus.Skipped;
}

export interface SuccessTestResult extends BaseTestResult {
  status: TestStatus.Success;
}

export type TestResult =
  | FailedTestResult
  | SkippedTestResult
  | SuccessTestResult;
