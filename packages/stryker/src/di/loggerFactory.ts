import { LoggerFactoryMethod } from 'stryker-api/logging';
import { tokens, commonTokens } from 'stryker-api/di';
import { TARGET_TOKEN } from 'typed-inject';

export function loggerFactory(getLogger: LoggerFactoryMethod, target: Function | undefined) {
  return getLogger(target ? target.name : 'UNKNOWN');
}
loggerFactory.inject = tokens(commonTokens.getLogger, TARGET_TOKEN);
