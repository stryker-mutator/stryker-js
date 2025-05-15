import { Logger } from '@stryker-mutator/api/logging';
import { LogLevel } from '@stryker-mutator/api/core';
import { LoggingEvent } from './logging-event.js';
import { LoggingSink } from './logging-sink.js';

export class LoggerImpl implements Logger {
  #categoryName;
  #loggingBackend;

  constructor(categoryName: string, loggingBackend: LoggingSink) {
    this.#categoryName = categoryName;
    this.#loggingBackend = loggingBackend;
  }

  isTraceEnabled(): boolean {
    return this.#loggingBackend.isEnabled(LogLevel.Trace);
  }
  isDebugEnabled(): boolean {
    return this.#loggingBackend.isEnabled(LogLevel.Debug);
  }
  isInfoEnabled(): boolean {
    return this.#loggingBackend.isEnabled(LogLevel.Information);
  }
  isWarnEnabled(): boolean {
    return this.#loggingBackend.isEnabled(LogLevel.Warning);
  }
  isErrorEnabled(): boolean {
    return this.#loggingBackend.isEnabled(LogLevel.Error);
  }
  isFatalEnabled(): boolean {
    return this.#loggingBackend.isEnabled(LogLevel.Fatal);
  }
  trace(message: string, ...args: any[]): void {
    this.#loggingBackend.log(
      LoggingEvent.create(this.#categoryName, LogLevel.Trace, [
        message,
        ...args,
      ]),
    );
  }
  debug(message: string, ...args: any[]): void {
    this.#loggingBackend.log(
      LoggingEvent.create(this.#categoryName, LogLevel.Debug, [
        message,
        ...args,
      ]),
    );
  }
  info(message: string, ...args: any[]): void {
    this.#loggingBackend.log(
      LoggingEvent.create(this.#categoryName, LogLevel.Information, [
        message,
        ...args,
      ]),
    );
  }
  warn(message: string, ...args: any[]): void {
    this.#loggingBackend.log(
      LoggingEvent.create(this.#categoryName, LogLevel.Warning, [
        message,
        ...args,
      ]),
    );
  }
  error(message: string, ...args: any[]): void {
    this.#loggingBackend.log(
      LoggingEvent.create(this.#categoryName, LogLevel.Error, [
        message,
        ...args,
      ]),
    );
  }
  fatal(message: string, ...args: any[]): void {
    this.#loggingBackend.log(
      LoggingEvent.create(this.#categoryName, LogLevel.Fatal, [
        message,
        ...args,
      ]),
    );
  }
}
