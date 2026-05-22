import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

/**
 * Reporter that triggers an interrupt after a configurable number of *new*
 * (non-reused) mutants have been tested.
 *
 * In incremental mode, early-result mutants (reused from a previous report)
 * also fire `onMutantTested`. This reporter uses `onMutationTestingPlanReady`
 * to count those early results so it can skip them and only interrupt after
 * genuinely new mutant results arrive.
 *
 * The number of new mutants to allow before interrupting is controlled by
 * the `STRYKER_SIGNAL_AFTER` environment variable (default: 1).
 *
 * Instead of sending an OS signal (which behaves differently on Windows),
 * this emits the SIGINT event directly on the process EventEmitter.
 */
class SignalReporter {
  #signaled = false;
  #totalCount = 0;
  #earlyResultCount = 0;
  #threshold = Number(process.env.STRYKER_SIGNAL_AFTER) || 1;

  onMutationTestingPlanReady(event) {
    this.#earlyResultCount = event.mutantPlans.filter(
      (p) => p.plan === 'EarlyResult',
    ).length;
  }

  onMutantTested() {
    this.#totalCount++;
    const newMutantsTested = this.#totalCount - this.#earlyResultCount;
    if (newMutantsTested >= this.#threshold && !this.#signaled) {
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
