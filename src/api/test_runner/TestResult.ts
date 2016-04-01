/**
 * Indicates what the result of a test run was.
 */
enum TestResult {
  /**
   * The TestRunner was able to complete the run. NOTE: This can still mean that one or more tests failed.
   */
  Complete,
  /**
   * The TestRunner was unable to complete the run due to an unexpected error. For example: the code contains a syntax error
   */
  Error,
  /**
   * The TestRunner was unable to complete the test run fast enough.
   */
  Timeout
}

export default TestResult;