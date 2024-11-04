import { LogLevel } from '@stryker-mutator/api/core';

export const logLevelPriority = Object.freeze({
  [LogLevel.Trace]: 0,
  [LogLevel.Debug]: 1,
  [LogLevel.Information]: 2,
  [LogLevel.Warning]: 3,
  [LogLevel.Error]: 4,
  [LogLevel.Fatal]: 5,
  [LogLevel.Off]: 6,
});

export function minPriority(a: LogLevel, b: LogLevel): LogLevel {
  return logLevelPriority[a] < logLevelPriority[b] ? a : b;
}
