interface TestRunnerSettings {

  /**
   * Represents test runner config file
   */
  configFile?: string;

  /**
   *  custom settings for test runner go here
   */
  config?: {
    [customConfig: string]: any;
  };

  /**
   * Represents project type for test runner
   */
  projectType?: string;
}

interface TestRunnerDescriptor {
  name: string;
  settings: TestRunnerSettings;
}

export default TestRunnerDescriptor;
