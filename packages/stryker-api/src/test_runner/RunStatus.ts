enum RunStatus {
  /**
   * Indicates that a test run is completed with failed or succeeded tests
   */
  Complete,
  /**
   * Indicates that a test run cut off early with an error
   */
  Error,
  /**
   * Indicates that a test run timed out
   */
  Timeout
}

export default RunStatus;
