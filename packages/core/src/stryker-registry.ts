export type ExitHandler = () => void;

export interface UnexpectedExitRegister {
  registerUnexpectedExitHandler(handler: ExitHandler): void;
}

const signals = Object.freeze(['SIGABRT', 'SIGINT', 'SIGHUP', 'SIGTERM']);

export class StrykerRegistry implements UnexpectedExitRegister {
  private readonly unexpectedExitHandlers: ExitHandler[] = [];

  public startHandleExit() {
    process.on('exit', this.handleExit);
    signals.forEach((signal) => process.on(signal, this.processSignal));
  }

  public stopHandleExit() {
    process.off('exit', this.handleExit);
    signals.forEach((signal) => process.off(signal, this.processSignal));
  }

  private processSignal(_signal: string, signalNumber: number) {
    // Just call 'exit' with correct exitCode.
    // See https://nodejs.org/api/process.html#process_signal_events, we should exit with 128 + signal number
    process.exit(128 + signalNumber);
  }

  public handleExit = () => {
    this.unexpectedExitHandlers.forEach((handler) => handler());
  };

  public registerUnexpectedExitHandler(handler: ExitHandler) {
    this.unexpectedExitHandlers.push(handler);
  }
}
