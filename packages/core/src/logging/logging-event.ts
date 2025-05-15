import { LogLevel } from '@stryker-mutator/api/core';
import util from 'util';

const pattern = [
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
].join('|');
const ansiRegex = new RegExp(pattern, 'g');

export class LoggingEvent {
  readonly startTime;
  readonly categoryName: string;
  readonly data: Array<unknown>;
  readonly level: LogLevel;
  readonly pid: number;

  private constructor(
    categoryName: string,
    level: LogLevel,
    data: Array<unknown>,
    startTime: Date,
    pid: number,
  ) {
    this.startTime = startTime;
    this.categoryName = categoryName;
    this.data = data;
    this.level = level;
    this.pid = pid;
  }

  static create(categoryName: string, level: LogLevel, data: Array<unknown>) {
    return new LoggingEvent(categoryName, level, data, new Date(), process.pid);
  }

  format(): string {
    return `${this.#formatPrefix()} ${this.#formatMessage().replace(ansiRegex, '')}`;
  }

  formatColorized(): string {
    return `${this.#colorizedStart()}${this.#formatPrefix()}${this.#colorizedEnd()} ${this.#formatMessage()}`;
  }

  #formatPrefix(): string {
    return `${this.startTime.toTimeString().slice(0, 8)} (${this.pid}) ${this.level.toUpperCase()} ${this.categoryName}`;
  }

  #formatMessage(): string {
    return util.format(...this.data);
  }
  #colorizedStart() {
    return `\x1B[${styles[this.level]}m`;
  }
  #colorizedEnd() {
    return '\x1B[39m';
  }

  static deserialize(ser: SerializedLoggingEvent): LoggingEvent {
    return new LoggingEvent(
      ser.categoryName,
      ser.level,
      [ser.message],
      new Date(ser.startTime),
      ser.pid,
    );
  }

  serialize(): SerializedLoggingEvent {
    return {
      startTime: this.startTime.toJSON(),
      categoryName: this.categoryName,
      message: this.#formatMessage(),
      level: this.level,
      pid: this.pid,
    };
  }
}

export interface SerializedLoggingEvent {
  startTime: string;
  categoryName: string;
  message: string;
  level: LogLevel;
  pid: number;
}

const styles = Object.freeze({
  trace: 34, // blue
  debug: 36, // cyan
  info: 32, // green
  warn: 33, // yellow
  error: 91, // red
  fatal: 35, // magenta
  off: 90, // grey
});
