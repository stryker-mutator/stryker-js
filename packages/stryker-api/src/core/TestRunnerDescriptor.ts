import TestRunnerSettings from './TestRunnerSettings';

interface TestRunnerDescriptor {
  name: string;
  settings?: TestRunnerSettings;
}

export default TestRunnerDescriptor;
