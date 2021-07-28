import { TestRunner } from '@stryker-mutator/api/test-runner';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';

import { LoggingClientContext } from '../logging';
import { coreTokens } from '../di';
import { Sandbox } from '../sandbox/sandbox';

import { RetryRejectedDecorator } from './retry-rejected-decorator';
import { TimeoutDecorator } from './timeout-decorator';
import { ChildProcessTestRunnerDecorator } from './child-process-test-runner-decorator';
import { CommandTestRunner } from './command-test-runner';
import { MaxTestRunnerReuseDecorator } from './max-test-runner-reuse-decorator';

createTestRunnerFactory.inject = tokens(commonTokens.options, coreTokens.sandbox, coreTokens.loggingContext, commonTokens.getLogger);
export function createTestRunnerFactory(
  options: StrykerOptions,
  sandbox: Pick<Sandbox, 'workingDirectory'>,
  loggingContext: LoggingClientContext,
  getLogger: LoggerFactoryMethod
): () => Required<TestRunner> {
  if (CommandTestRunner.is(options.testRunner)) {
    return () => new RetryRejectedDecorator(() => new TimeoutDecorator(() => new CommandTestRunner(sandbox.workingDirectory, options)));
  } else {
    return () =>
      new RetryRejectedDecorator(
        () =>
          new MaxTestRunnerReuseDecorator(
            () =>
              new TimeoutDecorator(
                () =>
                  new ChildProcessTestRunnerDecorator(
                    options,
                    sandbox.workingDirectory,
                    loggingContext,
                    getLogger(ChildProcessTestRunnerDecorator.name)
                  )
              ),
            options
          )
      );
  }
}
