import ChildProcessTestRunnerDecorator from './ChildProcessTestRunnerDecorator';
import TimeoutDecorator from './TimeoutDecorator';
import RetryDecorator from './RetryDecorator';
import LoggingClientContext from '../logging/LoggingClientContext';
import { TestRunner } from '@stryker-mutator/api/test_runner';
import CommandTestRunner from '../test-runner/CommandTestRunner';
import { StrykerOptions } from '@stryker-mutator/api/core';

export default {
  create(options: StrykerOptions, sandboxFileNames: ReadonlyArray<string>, sandboxWorkingDirectory: string, loggingContext: LoggingClientContext): Required<TestRunner> {
    if (CommandTestRunner.is(options.testRunner)) {
      return new RetryDecorator(() => new TimeoutDecorator(() => new CommandTestRunner(sandboxWorkingDirectory, options)));
    } else {
      return new RetryDecorator(() =>
        new TimeoutDecorator(() => new ChildProcessTestRunnerDecorator(options, sandboxFileNames, sandboxWorkingDirectory, loggingContext)));
    }
  }
};
