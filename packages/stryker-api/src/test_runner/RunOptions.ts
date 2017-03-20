/**
 * Represents an options object for a single run of a TestRunner.
 */
interface RunOptions {
  /**
   * The amount of time (in milliseconds) the TestRunner has to complete the test run before a timeout occurs.
   */
  timeout: number;
}

export default RunOptions;