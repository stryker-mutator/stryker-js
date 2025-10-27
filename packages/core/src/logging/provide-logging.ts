import { commonTokens, Scope } from '@stryker-mutator/api/plugin';
import { Injector } from 'typed-inject';
import { LoggingSink } from './logging-sink.js';
import { LoggerImpl } from './logger-impl.js';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { coreTokens } from '../di/index.js';
import { LoggingServer, LoggingServerAddress } from './logging-server.js';
import { LoggingBackend } from './logging-backend.js';
import { LoggingClient } from './logging-client.js';
import { LogLevel } from '@stryker-mutator/api/core';

function getLoggerFactory(loggingSink: LoggingSink) {
  return (categoryName?: string): Logger =>
    new LoggerImpl(categoryName ?? 'UNKNOWN', loggingSink);
}
getLoggerFactory.inject = [coreTokens.loggingSink] as const;

function loggerFactory(
  getLogger: LoggerFactoryMethod,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function | undefined,
) {
  return getLogger(target?.name);
}
loggerFactory.inject = [commonTokens.getLogger, commonTokens.target] as const;

export function provideLogging<
  T extends { [coreTokens.loggingSink]: LoggingSink },
>(injector: Injector<T>) {
  return injector
    .provideFactory(commonTokens.getLogger, getLoggerFactory)
    .provideFactory(commonTokens.logger, loggerFactory, Scope.Transient)
    .provideClass('loggingServer', LoggingServer);
}
provideLogging.inject = [
  coreTokens.loggingSink,
  commonTokens.injector,
] as const;

export async function provideLoggingBackend(
  injector: Injector,
  loggerConsoleOut: NodeJS.WriteStream,
) {
  const out = injector
    .provideValue(coreTokens.loggerConsoleOut, loggerConsoleOut)
    .provideClass(coreTokens.loggingSink, LoggingBackend)
    .provideClass(coreTokens.loggingServer, LoggingServer);
  const loggingServer = out.resolve(coreTokens.loggingServer);
  const loggingServerAddress = await loggingServer.listen();
  return out.provideValue(
    coreTokens.loggingServerAddress,
    loggingServerAddress,
  );
}
provideLoggingBackend.inject = [commonTokens.injector] as const;

export type LoggingProvider = ReturnType<typeof provideLogging>;

export async function provideLoggingClient(
  injector: Injector,
  loggingServerAddress: LoggingServerAddress,
  activeLogLevel: LogLevel,
) {
  const out = injector
    .provideValue(coreTokens.loggingServerAddress, loggingServerAddress)
    .provideValue(coreTokens.loggerActiveLevel, activeLogLevel)
    .provideClass(coreTokens.loggingSink, LoggingClient);
  await out.resolve(coreTokens.loggingSink).openConnection();
  return out;
}
