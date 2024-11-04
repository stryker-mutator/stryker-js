import { commonTokens, Scope } from '@stryker-mutator/api/plugin';
import { Injector } from 'typed-inject';
import { LoggingSink } from './logging-sink.js';
import { LoggerImpl } from './logger-impl.js';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { coreTokens } from '../di/index.js';
import { LoggingServer } from './logging-server.js';
import { LoggingBackend } from './logging-backend.js';
import { LoggingClient } from './logging-client.js';
import { LoggingClientContext } from '../logging/logging-client-context.js';

function getLoggerFactory(loggingSink: LoggingSink) {
  return (categoryName?: string): Logger => new LoggerImpl(categoryName ?? 'UNKNOWN', loggingSink);
}
getLoggerFactory.inject = [coreTokens.loggingSink] as const;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function loggerFactory(getLogger: LoggerFactoryMethod, target: Function | undefined) {
  return getLogger(target?.name);
}
loggerFactory.inject = [commonTokens.getLogger, commonTokens.target] as const;

export function provideLogging<T extends { [coreTokens.loggingSink]: LoggingSink }>(injector: Injector<T>) {
  return injector
    .provideFactory(commonTokens.getLogger, getLoggerFactory)
    .provideFactory(commonTokens.logger, loggerFactory, Scope.Transient)
    .provideClass('loggingServer', LoggingServer);
}
provideLogging.inject = [coreTokens.loggingSink, commonTokens.injector] as const;

export async function provideLoggingBackend(injector: Injector) {
  const out = injector.provideClass(coreTokens.loggingSink, LoggingBackend).provideClass('loggingServer', LoggingServer);
  const loggingPort = await out.resolve('loggingServer').listen();
  return out.provideValue(coreTokens.loggingServerAddress, { port: loggingPort });
}
provideLoggingBackend.inject = [commonTokens.injector] as const;

export type LoggingProvider = ReturnType<typeof provideLogging>;

export async function provideLoggingClient(injector: Injector, loggingClientContext: LoggingClientContext) {
  const out = injector.provideValue(coreTokens.loggingContext, loggingClientContext).provideClass(coreTokens.loggingSink, LoggingClient);
  await out.resolve(coreTokens.loggingSink).openConnection();
  return out;
}
