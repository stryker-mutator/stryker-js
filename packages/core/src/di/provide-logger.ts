import { Injector, Scope } from 'typed-inject';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { LoggerFactoryMethod, Logger } from '@stryker-mutator/api/logging';
import log4js from 'log4js';

export function provideLogger(injector: Injector): LoggerProvider {
  return injector.provideValue(commonTokens.getLogger, log4js.getLogger).provideFactory(commonTokens.logger, loggerFactory, Scope.Transient);
}
export type LoggerProvider = Injector<{ [commonTokens.getLogger]: LoggerFactoryMethod; [commonTokens.logger]: Logger }>;

// eslint-disable-next-line @typescript-eslint/ban-types
function loggerFactory(getLoggerMethod: LoggerFactoryMethod, target: Function | undefined) {
  return getLoggerMethod(target ? target.name : 'UNKNOWN');
}
loggerFactory.inject = [commonTokens.getLogger, commonTokens.target] as const;
