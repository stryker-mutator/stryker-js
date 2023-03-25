import { LogLevel } from '@stryker-mutator/api/core';
import log4js from 'log4js';

/**
 * Determines the minimal log level (where trace < off)
 * @param a one log level
 * @param b other log level
 */
export function minLevel(a: LogLevel, b: LogLevel): LogLevel {
  if (log4js.levels.getLevel(b, log4js.levels.INFO).isGreaterThanOrEqualTo(log4js.levels.getLevel(a, log4js.levels.INFO))) {
    return a;
  } else {
    return b;
  }
}
