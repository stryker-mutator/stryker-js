import { LoggerFactoryMethod } from 'stryker-api/logging';
import { TARGET_TOKEN, tokens } from 'typed-inject';
import { commonTokens } from '@stryker-mutator/util';

export function loggerFactory(getLogger: LoggerFactoryMethod, target: Function | undefined) {
  return getLogger(target ? target.name : 'UNKNOWN');
}
loggerFactory.inject = tokens(commonTokens.getLogger, TARGET_TOKEN);
