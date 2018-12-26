import * as log4js from 'log4js';
import { LogLevel } from 'stryker-api/core';

/**
 * Determines the minimal log level (where trace < off)
 * @param a one log level
 * @param b other log level
 */
export function minLevel(a: LogLevel, b: LogLevel) {
  if (log4js.levels.getLevel(b).isGreaterThanOrEqualTo(log4js.levels.getLevel(a))) {
    return a;
  } else {
    return b;
  }
}
