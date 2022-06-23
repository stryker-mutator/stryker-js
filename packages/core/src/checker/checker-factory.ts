import { FileDescriptions, StrykerOptions } from '@stryker-mutator/api/core';
import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import { coreTokens } from '../di/index.js';
import { LoggingClientContext } from '../logging/logging-client-context.js';

import { CheckerChildProcessProxy } from './checker-child-process-proxy.js';
import { CheckerFacade } from './checker-facade.js';
import { CheckerRetryDecorator } from './checker-retry-decorator.js';

createCheckerFactory.inject = tokens(
  commonTokens.options,
  commonTokens.fileDescriptions,
  coreTokens.loggingContext,
  coreTokens.pluginModulePaths,
  commonTokens.getLogger
);
export function createCheckerFactory(
  options: StrykerOptions,
  fileDescriptions: FileDescriptions,
  loggingContext: LoggingClientContext,
  pluginModulePaths: readonly string[],
  getLogger: LoggerFactoryMethod
): () => CheckerFacade {
  return () =>
    new CheckerFacade(
      () =>
        new CheckerRetryDecorator(
          () => new CheckerChildProcessProxy(options, fileDescriptions, pluginModulePaths, loggingContext),
          getLogger(CheckerRetryDecorator.name)
        )
    );
}
