import { Disposable } from '@stryker-mutator/api/plugin';

import { coreTokens } from './di/index.js';

/**
 * Async work that can run on signal termination (the event loop stays alive
 * long enough to await). Used for things like flushing a partial incremental report.
 */
export type ExitHandler = () => Promise<void>;

/**
 * Synchronous work that must run on `process.on('exit')` (and is also invoked
 * early on signals). Used for `--inPlace` backup restore, which cannot be async.
 */
export type SyncExitHandler = () => void;

const signals = Object.freeze(['SIGABRT', 'SIGINT', 'SIGHUP', 'SIGTERM']);

export class UnexpectedExitHandler implements Disposable {
  private readonly unexpectedExitHandlers: ExitHandler[] = [];
  private readonly syncExitHandlers: SyncExitHandler[] = [];
  private shuttingDown = false;
  private syncHandlersRan = false;

  public static readonly inject = [coreTokens.process] as const;
  constructor(
    private readonly process: Pick<NodeJS.Process, 'exit' | 'off' | 'on'>,
  ) {
    // `exit` covers process.exit(), uncaught exceptions that unwind to exit, etc.
    // Signal handlers alone miss those paths — required for --inPlace backup restore.
    process.on('exit', this.handleExit);
    signals.forEach((signal) => process.on(signal, this.processSignal));
  }

  private readonly processSignal = (_signal: string, signalNumber: number) => {
    // See https://nodejs.org/api/process.html#signal-events, we should exit with 128 + signal number
    const exitCode = 128 + signalNumber;

    if (this.shuttingDown) {
      // Second signal: force immediate exit without waiting for exit handlers.
      console.error('Forced exit. Received signal again while shutting down.');
      this.process.exit(exitCode);
      return; // `process.exit` is stubbed in tests, so return explicitly to prevent fall-through
    }
    this.shuttingDown = true;

    // Restore sync-critical state (e.g. --inPlace backups) before any async work.
    this.runSyncHandlers();

    if (this.unexpectedExitHandlers.length === 0) {
      this.process.exit(exitCode);
      return; // `process.exit` is stubbed in tests, so return explicitly to prevent fall-through
    }

    // Run async handlers before exiting. Signal handlers keep the event loop alive,
    // so we can await async work here. process.exit() will also fire `exit`, but
    // sync handlers are idempotent via syncHandlersRan.
    void Promise.allSettled(
      this.unexpectedExitHandlers.map((handler) => handler()),
    ).then(() => {
      this.process.exit(exitCode);
    });
  };

  private readonly handleExit = () => {
    this.runSyncHandlers();
  };

  private runSyncHandlers(): void {
    if (this.syncHandlersRan) {
      return;
    }
    this.syncHandlersRan = true;
    for (const handler of this.syncExitHandlers) {
      try {
        handler();
      } catch (error) {
        // Keep going so remaining sync handlers still run, and the signal path
        // can still call process.exit() after this returns.
        console.error('Unexpected exit sync handler failed:', error);
      }
    }
  }

  public registerHandler(handler: ExitHandler): void {
    this.unexpectedExitHandlers.push(handler);
  }

  public registerSyncHandler(handler: SyncExitHandler): void {
    this.syncExitHandlers.push(handler);
  }

  public dispose(): void {
    this.process.off('exit', this.handleExit);
    signals.forEach((signal) => this.process.off(signal, this.processSignal));
  }
}
