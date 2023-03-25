/**
 * Represents the capabilities of a test runner.
 */
export interface TestRunnerCapabilities {
  /**
   * When true, the test runner is capable of reloading the test environment. Otherwise false.
   * Reloading means creating a new nodejs process, or reloading the browser.
   * When true, the test runner should reload the test environment when `reloadEnvironment` is present in the run options.
   */
  reloadEnvironment: boolean;
}
