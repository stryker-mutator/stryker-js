import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

/**
 * Minimal reporter that writes a marker to stdout when the first mutant
 * is tested. This allows the e2e test to know exactly when partial results
 * exist, eliminating timing-based race conditions.
 */
class SignalReporter {
  #signaled = false;

  onMutantTested() {
    if (!this.#signaled) {
      this.#signaled = true;
      process.stdout.write('__MUTANT_TESTED__\n');
    }
  }
}

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Reporter, 'signal', SignalReporter),
];
