import os from 'os';

import { MatchedMutant } from '@stryker-mutator/api/report';

import { ProgressKeeper } from './progress-keeper';

export class ProgressAppendOnlyReporter extends ProgressKeeper {
  private intervalReference?: NodeJS.Timer;

  public onAllMutantsMatchedWithTests(matchedMutants: readonly MatchedMutant[]): void {
    super.onAllMutantsMatchedWithTests(matchedMutants);
    if (matchedMutants.length) {
      this.intervalReference = setInterval(() => this.render(), 10000);
    }
  }

  public onAllMutantsTested(): void {
    if (this.intervalReference) {
      clearInterval(this.intervalReference);
    }
  }

  private render() {
    process.stdout.write(
      `Mutation testing ${this.getPercentDone()} (elapsed: ${this.getElapsedTime()}, remaining: ${this.getEtc()}) ` +
        `${this.progress.tested}/${this.progress.total} tested (${this.progress.survived} survived, ${this.progress.timedOut} timed out)` +
        os.EOL
    );
  }

  private getPercentDone() {
    return `${Math.floor((this.progress.tested / this.progress.total) * 100)}%`;
  }
}
