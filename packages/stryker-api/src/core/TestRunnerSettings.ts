interface TestRunnerSettings {

  /**
   * this ensures that test runners can load custom config.
   */

  [customConfig: string]: any;

  /**
   * Represents test runner config file
   */
  configFile?: string;

  /**
   * Override config settings of test runner
   */
  config?: {
    [customConfig: string]: any;
  };

  /**
   * Represents project type for test runner
   */
  projectType?: string;
}

export default TestRunnerSettings;
