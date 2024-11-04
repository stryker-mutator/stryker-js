import net from 'net';
import { Disposable } from '@stryker-mutator/api/plugin';
import { LoggingSink } from './logging-sink.js';
import { LoggingClientContext } from '../logging/logging-client-context.js';
import { LogLevel } from '@stryker-mutator/api/core';
import { LoggingEvent } from './logging-event.js';
import { promisify } from 'util';
import { DELIMITER } from './logging-server.js';
import { logLevelPriority } from './priority.js';
import { coreTokens } from '../di/index.js';

export class LoggingClient implements LoggingSink, Disposable {
  #socket?: net.Socket;

  static readonly inject = [coreTokens.loggingContext] as const;
  constructor(private loggingClientContext: LoggingClientContext) {}

  openConnection() {
    return new Promise<void>((res, rej) => {
      this.#socket = net.createConnection(this.loggingClientContext.port, 'localhost', () => {
        res();
      });
      this.#socket.on('error', (error) => {
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
    if (this.isEnabled(event.level)) {
      this.#socket.write(JSON.stringify(event.serialize()) + DELIMITER);
    }
  }
  isEnabled(level: LogLevel): boolean {
    return logLevelPriority[level] >= logLevelPriority[this.loggingClientContext.level];
  }

  async dispose(): Promise<void> {
    if (this.#socket) {
      await promisify(this.#socket.end).bind(this.#socket)();
    }
  }
}
