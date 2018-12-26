import { RunnerOptions } from 'stryker-api/test_runner';
import LoggingClientContext from '../logging/LoggingClientContext';
import CommandTestRunner from '../test-runner/CommandTestRunner';
import ChildProcessTestRunnerDecorator from './ChildProcessTestRunnerDecorator';
import RetryDecorator from './RetryDecorator';
import TestRunnerDecorator from './TestRunnerDecorator';
import TimeoutDecorator from './TimeoutDecorator';

export default {
  create(testRunnerName: string, settings: RunnerOptions, sandboxWorkingDirectory: string, loggingContext: LoggingClientContext): TestRunnerDecorator {
    if (CommandTestRunner.is(testRunnerName)) {
      return new RetryDecorator(() => new TimeoutDecorator(() => new CommandTestRunner(sandboxWorkingDirectory, settings)));
    } else {
      return new RetryDecorator(() =>
        new TimeoutDecorator(() => new ChildProcessTestRunnerDecorator(testRunnerName, settings, sandboxWorkingDirectory, loggingContext)));
    }
  }
};
