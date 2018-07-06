import { LogLevel } from 'stryker-api/core';


export default interface LoggingClientContext {
  readonly port: number;
  readonly level: LogLevel;
}