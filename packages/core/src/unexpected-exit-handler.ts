import { Disposable } from '@stryker-mutator/api/plugin';

import { coreTokens } from './di/index.js';

export type ExitHandler = () => Promise<void>;

const signals = Object.freeze(['SIGABRT', 'SIGINT', 'SIGHUP', 'SIGTERM']);
// npm forwards a signal to Stryker that a process group signal also delivered, so one interrupt can arrive
// twice, milliseconds apart; a person pressing Ctrl+C again is seconds apart
const REPEAT_WINDOW_MS = 1000;

export class UnexpectedExitHandler implements Disposable {
  private readonly unexpectedExitHandlers: ExitHandler[] = [];
  private firstSignal?: { signal: string; at: number };

  public static readonly inject = [coreTokens.process] as const;
  constructor(
    private readonly process: Pick<NodeJS.Process, 'exit' | 'off' | 'on'>,
  ) {
    signals.forEach((signal) => process.on(signal, this.processSignal));
  }

  private readonly processSignal = (signal: string, signalNumber: number) => {
    // See https://nodejs.org/api/process.html#signal-events, we should exit with 128 + signal number
    const exitCode = 128 + signalNumber;

    if (this.firstSignal) {
      // The same signal again within a moment is the same interrupt: keep shutting down.
      if (
        signal === this.firstSignal.signal &&
        Date.now() - this.firstSignal.at < REPEAT_WINDOW_MS
      ) {
        return;
      }
      // Second signal: force immediate exit without waiting for exit handlers.
      console.error('Forced exit. Received signal again while shutting down.');
      this.process.exit(exitCode);
      return; // `process.exit` is stubbed in tests, so return explicitly to prevent fall-through
    }
    this.firstSignal = { signal, at: Date.now() };

    if (this.unexpectedExitHandlers.length === 0) {
      this.process.exit(exitCode);
      return; // `process.exit` is stubbed in tests, so return explicitly to prevent fall-through
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
