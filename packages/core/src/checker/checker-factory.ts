import { StrykerOptions } from '@stryker-mutator/api/core';
import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import { coreTokens } from '../di';
import { LoggingClientContext } from '../logging/logging-client-context';

import { CheckerChildProcessProxy } from './checker-child-process-proxy';
import { CheckerResource } from './checker-resource';
import { CheckerRetryDecorator } from './checker-retry-decorator';

createCheckerFactory.inject = tokens(commonTokens.options, coreTokens.loggingContext, commonTokens.getLogger);
export function createCheckerFactory(
  options: StrykerOptions,
  loggingContext: LoggingClientContext,
  getLogger: LoggerFactoryMethod
): () => CheckerResource {
  return () => new CheckerRetryDecorator(() => new CheckerChildProcessProxy(options, loggingContext), getLogger(CheckerRetryDecorator.name));
}
