import { TestRunner } from '@stryker-mutator/api/test-runner';
import { FileDescriptions, StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';

import { LoggingServerAddress } from '../logging/index.js';
import { coreTokens } from '../di/index.js';
import { Sandbox } from '../sandbox/sandbox.js';

import { IdGenerator } from '../child-proxy/id-generator.js';

import { RetryRejectedDecorator } from './retry-rejected-decorator.js';
import { TimeoutDecorator } from './timeout-decorator.js';
import { ChildProcessTestRunnerProxy } from './child-process-test-runner-proxy.js';
import { CommandTestRunner } from './command-test-runner.js';
import { MaxTestRunnerReuseDecorator } from './max-test-runner-reuse-decorator.js';
import { ReloadEnvironmentDecorator } from './reload-environment-decorator.js';

createTestRunnerFactory.inject = tokens(
  commonTokens.options,
  commonTokens.fileDescriptions,
  coreTokens.sandbox,
  coreTokens.loggingServerAddress,
  commonTokens.getLogger,
  coreTokens.pluginModulePaths,
  coreTokens.workerIdGenerator,
);
export function createTestRunnerFactory(
  options: StrykerOptions,
  fileDescriptions: FileDescriptions,
  sandbox: Pick<Sandbox, 'workingDirectory'>,
  loggingServerAddress: LoggingServerAddress,
  getLogger: LoggerFactoryMethod,
  pluginModulePaths: readonly string[],
  idGenerator: IdGenerator,
): () => TestRunner {
  if (CommandTestRunner.is(options.testRunner)) {
    return () =>
      new RetryRejectedDecorator(
        getLogger(RetryRejectedDecorator.name),
        () =>
          new TimeoutDecorator(
            getLogger(TimeoutDecorator.name),
            () => new CommandTestRunner(sandbox.workingDirectory, options),
          ),
      );
  } else {
    return () =>
      new RetryRejectedDecorator(
        getLogger(RetryRejectedDecorator.name),
        () =>
          new ReloadEnvironmentDecorator(
            () =>
              new MaxTestRunnerReuseDecorator(
                () =>
                  new TimeoutDecorator(
                    getLogger(TimeoutDecorator.name),
                    () =>
                      new ChildProcessTestRunnerProxy(
                        options,
                        fileDescriptions,
                        sandbox.workingDirectory,
                        loggingServerAddress,
                        pluginModulePaths,
                        getLogger,
                        idGenerator,
                      ),
                  ),
                options,
              ),
          ),
      );
  }
}
