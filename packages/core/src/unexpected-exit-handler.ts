import { Disposable } from '@stryker-mutator/api/plugin';

import { coreTokens } from './di/index.js';

export type ExitHandler = () => void;

const signals = Object.freeze(['SIGABRT', 'SIGINT', 'SIGHUP', 'SIGTERM']);
export class UnexpectedExitHandler implements Disposable {
  private readonly unexpectedExitHandlers: ExitHandler[] = [];

  public static readonly inject = [coreTokens.process] as const;
  constructor(
    private readonly process: Pick<NodeJS.Process, 'exit' | 'off' | 'on'>,
  ) {
    process.on('exit', this.handleExit);
    signals.forEach((signal) => process.on(signal, this.processSignal));
  }
  private readonly processSignal = (_signal: string, signalNumber: number) => {
    // Just call 'exit' with correct exitCode.
    // See https://nodejs.org/api/process.html#process_signal_events, we should exit with 128 + signal number
    this.process.exit(128 + signalNumber);
  };

  private readonly handleExit = () => {
    this.unexpectedExitHandlers.forEach((handler) => handler());
  };

  public registerHandler(handler: ExitHandler): void {
    this.unexpectedExitHandlers.push(handler);
  }

  public dispose(): void {
    this.process.off('exit', this.handleExit);
    signals.forEach((signal) => this.process.off(signal, this.processSignal));
  }
}
