import { FileDescriptions, StrykerOptions } from '@stryker-mutator/api/core';
import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import { IdGenerator } from '../child-proxy/id-generator.js';

import { coreTokens } from '../di/index.js';

import { CheckerChildProcessProxy } from './checker-child-process-proxy.js';
import { CheckerFacade } from './checker-facade.js';
import { CheckerRetryDecorator } from './checker-retry-decorator.js';
import { minPriority } from '../logging-new/priority.js';

createCheckerFactory.inject = tokens(
  commonTokens.options,
  commonTokens.fileDescriptions,
  coreTokens.loggingServerAddress,
  coreTokens.pluginModulePaths,
  commonTokens.getLogger,
  coreTokens.workerIdGenerator,
);
export function createCheckerFactory(
  options: StrykerOptions,
  fileDescriptions: FileDescriptions,
  { port }: { port: number },
  pluginModulePaths: readonly string[],
  getLogger: LoggerFactoryMethod,
  idGenerator: IdGenerator,
): () => CheckerFacade {
  return () =>
    new CheckerFacade(
      () =>
        new CheckerRetryDecorator(
          () =>
            new CheckerChildProcessProxy(
              options,
              fileDescriptions,
              pluginModulePaths,
              { port, level: minPriority(options.logLevel, options.fileLogLevel) },
              idGenerator,
            ),
          getLogger(CheckerRetryDecorator.name),
        ),
    );
}
