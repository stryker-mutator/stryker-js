import { Disposable } from '@stryker-mutator/api/plugin';

import { coreTokens } from './di/index.js';

export type ExitHandler = () => void;
export type AsyncExitHandler = () => Promise<void>;

const signals = Object.freeze(['SIGABRT', 'SIGINT', 'SIGHUP', 'SIGTERM']);

export class UnexpectedExitHandler implements Disposable {
  private readonly unexpectedExitHandlers: ExitHandler[] = [];
  private readonly unexpectedAsyncExitHandlers: AsyncExitHandler[] = [];
  private shuttingDown = false;

  public static readonly inject = [coreTokens.process] as const;
  constructor(
    private readonly process: Pick<NodeJS.Process, 'exit' | 'off' | 'on'>,
  ) {
    process.on('exit', this.handleExit);
    signals.forEach((signal) => process.on(signal, this.processSignal));
  }

  private readonly processSignal = (_signal: string, signalNumber: number) => {
    // See https://nodejs.org/api/process.html#signal-events, we should exit with 128 + signal number
    const exitCode = 128 + signalNumber;

    if (this.shuttingDown) {
      // Second signal: force immediate exit without waiting for async handlers.
      console.error('Forced exit. Received signal again while shutting down.');
      this.process.exit(exitCode);
      return;
    }
    this.shuttingDown = true;

    if (this.unexpectedAsyncExitHandlers.length === 0) {
      // No async handlers, just call 'exit' with correct exitCode.
      this.process.exit(exitCode);
    }

    // Run async handlers before exiting. Signal handlers keep the event loop alive,
    // so we can await async work here, unlike process.on('exit') handlers.
    // "Listener functions must only perform synchronous operations."
    // https://nodejs.org/api/process.html#event-exit
    void Promise.allSettled(
      this.unexpectedAsyncExitHandlers.map((handler) => handler()),
    ).then(() => {
      this.process.exit(exitCode);
    });
  };

  private readonly handleExit = () => {
    this.unexpectedExitHandlers.forEach((handler) => handler());
  };

  public registerHandler(handler: ExitHandler): void {
    this.unexpectedExitHandlers.push(handler);
  }

  public registerAsyncHandler(handler: AsyncExitHandler): void {
    this.unexpectedAsyncExitHandlers.push(handler);
  }

  public dispose(): void {
    this.process.off('exit', this.handleExit);
    signals.forEach((signal) => this.process.off(signal, this.processSignal));
  }
}
