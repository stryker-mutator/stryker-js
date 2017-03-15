import { RunnerOptions } from 'stryker-api/test_runner';

interface IsolatedRunnerOptions extends RunnerOptions {
  sandboxWorkingFolder: string;
}

export default IsolatedRunnerOptions;