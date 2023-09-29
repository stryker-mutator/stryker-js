import { FileDescriptions, StrykerOptions } from '@stryker-mutator/api/core';
import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import { IdGenerator } from '../child-proxy/id-generator.js';

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
  commonTokens.getLogger,
  coreTokens.workerIdGenerator,
);
export function createCheckerFactory(
  options: StrykerOptions,
  fileDescriptions: FileDescriptions,
  loggingContext: LoggingClientContext,
  pluginModulePaths: readonly string[],
  getLogger: LoggerFactoryMethod,
  idGenerator: IdGenerator,
): () => CheckerFacade {
  return () =>
    new CheckerFacade(
      () =>
        new CheckerRetryDecorator(
          () => new CheckerChildProcessProxy(options, fileDescriptions, pluginModulePaths, loggingContext, idGenerator),
          getLogger(CheckerRetryDecorator.name),
        ),
    );
}
