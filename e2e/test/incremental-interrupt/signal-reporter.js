import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

/**
 * Minimal reporter that triggers an interrupt after the first mutant is tested.
 *
 * Instead of sending an OS signal (which behaves differently on Windows),
 * this emits the SIGINT event directly on the process EventEmitter.
 */
class SignalReporter {
  #signaled = false;

  onMutantTested() {
    if (!this.#signaled) {
      this.#signaled = true;
      // process.emit calls registered listeners directly (cross-platform).
      // Args match what Node.js passes for a real signal: (signalName, signalNumber).
      // SIGINT = signal number 2 → exit code 130 (128 + 2).
      process.emit('SIGINT', 'SIGINT', 2);
    }
  }
}

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Reporter, 'signal', SignalReporter),
];
