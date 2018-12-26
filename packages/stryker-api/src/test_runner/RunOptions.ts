/**
 * Represents an options object for a single run of a TestRunner.
 */
interface RunOptions {

  mutatedFileName?: string;

  /**
   * The hooks JavaScript code that has to be loaded in the testing environment.
   * It should be loaded right after the test framework but right before any tests can run.
   */
  testHooks?: string;
  /**
   * The amount of time (in milliseconds) the TestRunner has to complete the test run before a timeout occurs.
   */
  timeout: number;
}

export default RunOptions;
