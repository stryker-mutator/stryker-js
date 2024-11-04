import fs from 'fs';
import { LogLevel } from '@stryker-mutator/api/core';
import { LoggingEvent } from './logging-event.js';
import { Disposable } from 'typed-inject';
import { promisify } from 'util';
import { LoggingSink } from './logging-sink.js';
import { logLevelPriority } from './priority.js';

const LOG_FILE_NAME = 'stryker.log';

/**
 * The logging backend that handles the actual logging. So to both a file and the stdout.
 */
export class LoggingBackend implements LoggingSink, Disposable {
  activeStdoutLevel: LogLevel = LogLevel.Information;
  activeFileLevel: LogLevel = LogLevel.Off;
  showColors = true;

  log(event: LoggingEvent) {
    const eventPriority = logLevelPriority[event.level];
    if (eventPriority >= logLevelPriority[this.activeStdoutLevel]) {
      process.stdout.write(`${this.showColors ? event.formatColorized() : event.format()}\n`);
    }
    if (eventPriority >= logLevelPriority[this.activeFileLevel] && !this.#fileStream.errored) {
      this.#fileStream.write(`${event.format()}\n`);
    }
  }

  isEnabled(level: LogLevel) {
    const priority = logLevelPriority[level];
    return priority >= logLevelPriority[this.activeStdoutLevel] || priority >= logLevelPriority[this.activeFileLevel];
  }

  #_fileStream?: fs.WriteStream;
  get #fileStream() {
    if (!this.#_fileStream) {
      this.#_fileStream = fs.createWriteStream(LOG_FILE_NAME, { flags: 'a' });
      this.#_fileStream.on('error', (error) => {
        console.error(`An error occurred while writing to "${LOG_FILE_NAME}"`, error);
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
