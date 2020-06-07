/**
 * Indicates what the result of a single test was.
 */
enum TestStatus {
  /**
   * The test succeeded
   */
  Success,
  /**
   * The test failed
   */
  Failed,
  /**
   * The test was skipped (not executed)
   */
  Skipped
}

export default TestStatus;
