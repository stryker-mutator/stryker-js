import { RunnerOptions } from 'stryker-api/test_runner';
import LoggingClientContext from '../logging/LoggingClientContext';

interface IsolatedRunnerOptions extends RunnerOptions {
  sandboxWorkingFolder: string;
  loggingContext: LoggingClientContext;
}

export default IsolatedRunnerOptions;