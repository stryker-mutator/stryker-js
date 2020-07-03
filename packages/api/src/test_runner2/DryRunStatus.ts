export enum DryRunStatus {
  /**
   * Indicates that a test run is completed with failed or succeeded tests
   */
  Complete = 'complete',
  /**
   * Indicates that a test run cut off early with an error
   */
  Error = 'error',
  /**
   * Indicates that a test run timed out
   */
  Timeout = 'timeout',
}
