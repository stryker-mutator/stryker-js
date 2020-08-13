import { TestStatus } from './TestStatus';

/**
 * Indicates the result of a single test
 */
export interface TestResult {
  /**
   * The full human readable name of the test
   */
  name: string;
  /**
   * The status of the test
   */
  status: TestStatus;
  /**
   * The time it took to run the test
   */
  timeSpentMs: number;
  /**
   * Optional: messages in case of status: Failed
   */
  failureMessages?: string[];
}
