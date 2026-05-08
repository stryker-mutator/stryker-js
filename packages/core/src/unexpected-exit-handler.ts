import { Disposable } from '@stryker-mutator/api/plugin';

import { coreTokens } from './di/index.js';

export type ExitHandler = () => Promise<void>;

const signals = Object.freeze(['SIGABRT', 'SIGINT', 'SIGHUP', 'SIGTERM']);

export class UnexpectedExitHandler implements Disposable {
  private readonly unexpectedExitHandlers: ExitHandler[] = [];
  private shuttingDown = false;

  public static readonly inject = [coreTokens.process] as const;
  constructor(
    private readonly process: Pick<NodeJS.Process, 'exit' | 'off' | 'on'>,
  ) {
    signals.forEach((signal) => process.on(signal, this.processSignal));
  }

  private readonly processSignal = (_signal: string, signalNumber: number) => {
    // See https://nodejs.org/api/process.html#signal-events, we should exit with 128 + signal number
    const exitCode = 128 + signalNumber;

    if (this.shuttingDown) {
      // Second signal: force immediate exit without waiting for exit handlers.
      console.error('Forced exit. Received signal again while shutting down.');
      this.process.exit(exitCode);
    }
    this.shuttingDown = true;

    if (this.unexpectedExitHandlers.length === 0) {
      this.process.exit(exitCode);
    }

    // Run async handlers before exiting. Signal handlers keep the event loop alive,
    // so we can await async work here.
    void Promise.allSettled(
      this.unexpectedExitHandlers.map((handler) => handler()),
    ).then(() => {
      this.process.exit(exitCode);
    });
  };

  public registerHandler(handler: ExitHandler): void {
    this.unexpectedExitHandlers.push(handler);
  }

  public dispose(): void {
    signals.forEach((signal) => this.process.off(signal, this.processSignal));
  }
}
