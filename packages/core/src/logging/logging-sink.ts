import { LogLevel } from '@stryker-mutator/api/core';
import { LoggingEvent } from './logging-event.js';

export interface LoggingSink {
  log(event: LoggingEvent): void;
  isEnabled(level: LogLevel): boolean;
}
