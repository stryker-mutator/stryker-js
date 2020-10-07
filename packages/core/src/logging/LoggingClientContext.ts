import { LogLevel } from '@stryker-mutator/api/core';

export interface LoggingClientContext {
  /**
   * The port where the logging server listens for logging events on the localhost
   */
  readonly port: number;
  /**
   * The minimal log level to use for configuration
   */
  readonly level: LogLevel;
}
