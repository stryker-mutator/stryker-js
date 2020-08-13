/**
 * Represents an options object for a single run of a TestRunner.
 */
export interface RunOptions {
  /**
   * The amount of time (in milliseconds) the TestRunner has to complete the test run before a timeout occurs.
   */
  timeout: number;

  /**
   * The hooks JavaScript code that has to be loaded in the testing environment.
   * It should be loaded right after the test framework but right before any tests can run.
   */
  testHooks?: string;

  mutatedFileName?: string;
}
