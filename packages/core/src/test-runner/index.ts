import { TestRunner } from '@stryker-mutator/api/test_runner';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import { LoggingClientContext } from '../logging';
import { coreTokens } from '../di';
import { Sandbox } from '../sandbox/sandbox';

import RetryDecorator from './RetryDecorator';
import TimeoutDecorator from './TimeoutDecorator';
import ChildProcessTestRunnerDecorator from './ChildProcessTestRunnerDecorator';
import CommandTestRunner from './CommandTestRunner';
import MaxTestRunnerReuseDecorator from './MaxTestRunnerReuseDecorator';

createTestRunnerFactory.inject = tokens(commonTokens.options, coreTokens.sandbox, coreTokens.loggingContext);
export function createTestRunnerFactory(
  options: StrykerOptions,
  sandbox: Pick<Sandbox, 'sandboxFileNames' | 'workingDirectory'>,
  loggingContext: LoggingClientContext
): () => Required<TestRunner> {
  if (CommandTestRunner.is(options.testRunner)) {
    return () => new RetryDecorator(() => new TimeoutDecorator(() => new CommandTestRunner(sandbox.workingDirectory, options)));
  } else {
    return () =>
      new RetryDecorator(
        () =>
          new MaxTestRunnerReuseDecorator(
            () => new TimeoutDecorator(() => new ChildProcessTestRunnerDecorator(options, sandbox.workingDirectory, loggingContext)),
            options
          )
      );
  }
}
