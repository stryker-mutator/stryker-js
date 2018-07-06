import { LogLevel } from 'stryker-api/core';
import * as log4js from 'log4js';

/**
 * Determines the minimal log level (where trace < off)
 * @param a one log level
 * @param b other log level
 */
export function minLevel(a: LogLevel, b: LogLevel) {
  if (getLevel(b).isGreaterThanOrEqualTo(getLevel(a))) {
    return a;
  } else {
    return b;
  }
}

function getLevel(level: LogLevel): log4js.Level {
  // Needs an any cast here, wrongly typed, see https://github.com/log4js-node/log4js-node/pull/745
  return (log4js.levels as any).getLevel(level);
}
