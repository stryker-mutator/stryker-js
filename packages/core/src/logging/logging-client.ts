import net from 'net';
import { Disposable } from '@stryker-mutator/api/plugin';
import { LoggingServerAddress, LoggingSink } from '../logging/index.js';
import { LogLevel } from '@stryker-mutator/api/core';
import { LoggingEvent } from './logging-event.js';
import { promisify } from 'util';
import { DELIMITER } from './logging-server.js';
import { logLevelPriority } from './priority.js';
import { coreTokens } from '../di/index.js';

export class LoggingClient implements LoggingSink, Disposable {
  #socket?: net.Socket;

  static readonly inject = [
    coreTokens.loggerActiveLevel,
    coreTokens.loggingServerAddress,
  ] as const;
  constructor(
    private logLevel: LogLevel,
    private loggingServerAddress: LoggingServerAddress,
  ) {}

  openConnection() {
    return new Promise<void>((res, rej) => {
      this.#socket = net.createConnection(
        this.loggingServerAddress.port,
        'localhost',
        res,
      );
      this.#socket.on('error', (error) => {
        console.error('Error occurred in logging client', error);
        rej(error);
      });
    });
  }

  log(event: LoggingEvent): void {
    if (!this.#socket) {
      throw new Error(
        `Cannot use the logging client before it is connected, please call '${LoggingClient.name}.prototype.${LoggingClient.prototype.openConnection.name}' first`,
      );
    }
    if (this.isEnabled(event.level) && this.#socket.writable) {
      this.#socket.write(JSON.stringify(event.serialize()) + DELIMITER);
    }
  }
  isEnabled(level: LogLevel): boolean {
    return logLevelPriority[level] >= logLevelPriority[this.logLevel];
  }

  async dispose(): Promise<void> {
    if (this.#socket) {
      await promisify(this.#socket.end).bind(this.#socket)();
    }
  }
}
