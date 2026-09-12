import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

/**
 * Reporter that hard-crashes the process after a configurable number of *new*
 * (non-reused) mutants have been tested, without going through SIGINT handlers.
 *
 * Used to verify incremental crash recovery via the pending journal (WAL),
 * as opposed to the signal-handler compact path.
 *
 * `process.exit` is synchronous on purpose. `onMutantTested` is broadcast
 * without awaiting the run; an async wait would let `complete()` delete the
 * pending directory before this reporter exits.
 *
 * - `STRYKER_CRASH_AFTER`: number of new mutants before crash (unset = disabled)
 * - `STRYKER_CRASH_BEFORE_BEGIN`: if set, `process.exit` on dry-run completed
 */
class CrashReporter {
  #crashed = false;
  #totalCount = 0;
  #earlyResultCount = 0;
  #threshold = Number(process.env.STRYKER_CRASH_AFTER);

  onDryRunCompleted() {
    if (process.env.STRYKER_CRASH_BEFORE_BEGIN && !this.#crashed) {
      this.#crashed = true;
      process.exit(1);
    }
  }

  onMutationTestingPlanReady(event) {
    this.#earlyResultCount = event.mutantPlans.filter(
      (p) => p.plan === 'EarlyResult',
    ).length;
  }

  onMutantTested() {
    if (!this.#threshold) {
      return;
    }
    this.#totalCount++;
    const newMutantsTested = this.#totalCount - this.#earlyResultCount;
    if (newMutantsTested >= this.#threshold && !this.#crashed) {
      this.#crashed = true;
      process.exit(1);
    }
  }
}

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Reporter, 'crash', CrashReporter),
];
