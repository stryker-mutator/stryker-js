interface TestRunnerSettings {
  configFile?: string;
  config?: {
    [customConfig: string]: any;
  };
}

interface TestRunnerDescriptor {
  name: string;
  settings: TestRunnerSettings;
}

export default TestRunnerDescriptor;
