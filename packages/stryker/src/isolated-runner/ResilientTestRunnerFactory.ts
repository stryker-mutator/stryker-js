import IsolatedTestRunnerAdapter from './IsolatedTestRunnerAdapter';
import TimeoutDecorator from './TimeoutDecorator';
import RetryDecorator from './RetryDecorator';
import TestRunnerDecorator from './TestRunnerDecorator';
import LoggingClientContext from '../logging/LoggingClientContext';
import { RunnerOptions } from 'stryker-api/test_runner';


export default {
  create(testRunnerName: string, settings: RunnerOptions, sandboxWorkingDirectory: string, loggingContext: LoggingClientContext): TestRunnerDecorator {
    return new RetryDecorator(() =>
      new TimeoutDecorator(() => new IsolatedTestRunnerAdapter(testRunnerName, settings, sandboxWorkingDirectory, loggingContext)));
  }
};