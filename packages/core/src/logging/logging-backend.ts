import fs from 'fs';
import { LogLevel, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { LoggingEvent } from './logging-event.js';
import { Disposable } from 'typed-inject';
import { promisify } from 'util';
import { LoggingSink } from './logging-sink.js';
import { logLevelPriority, minPriority } from './priority.js';
import { coreTokens } from '../di/index.js';

const LOG_FILE_NAME = 'stryker.log';

/**
 * The logging backend that handles the actual logging. So to both a file and the stdout, stderr.
 */
export class LoggingBackend implements LoggingSink, Disposable {
  activeStdoutLevel: LogLevel = LogLevel.Information;
  activeFileLevel: LogLevel = LogLevel.Off;
  showColors = true;
  #consoleOut;

  static readonly inject = [coreTokens.loggerConsoleOut] as const;

  constructor(consoleOut: NodeJS.WritableStream) {
    this.#consoleOut = consoleOut;
  }

  log(event: LoggingEvent) {
    const eventPriority = logLevelPriority[event.level];
    if (eventPriority >= logLevelPriority[this.activeStdoutLevel]) {
      this.#consoleOut.write(
        `${this.showColors ? event.formatColorized() : event.format()}\n`,
      );
    }
    if (
      eventPriority >= logLevelPriority[this.activeFileLevel] &&
      !this.#fileStream.errored
    ) {
      this.#fileStream.write(`${event.format()}\n`);
    }
  }

  isEnabled(level: LogLevel) {
    const priority = logLevelPriority[level];
    return priority >= this.priority;
  }

  get activeLogLevel() {
    return minPriority(this.activeStdoutLevel, this.activeFileLevel);
  }

  get priority() {
    return logLevelPriority[this.activeLogLevel];
  }

  configure({
    logLevel,
    fileLogLevel,
    allowConsoleColors,
  }: PartialStrykerOptions) {
    if (logLevel) {
      this.activeStdoutLevel = logLevel;
    }
    if (fileLogLevel) {
      this.activeFileLevel = fileLogLevel;
    }
    if (allowConsoleColors !== undefined) {
      this.showColors = allowConsoleColors;
    }
  }

  #_fileStream?: fs.WriteStream;
  get #fileStream() {
    if (!this.#_fileStream) {
      this.#_fileStream = fs.createWriteStream(LOG_FILE_NAME, { flags: 'a' });
      this.#_fileStream.on('error', (error) => {
        console.error(
          `An error occurred while writing to "${LOG_FILE_NAME}"`,
          error,
        );
      });
    }
    return this.#_fileStream;
  }

  async dispose() {
    if (this.#_fileStream) {
      await promisify(this.#_fileStream.end).bind(this.#_fileStream)();
    }
  }
}
