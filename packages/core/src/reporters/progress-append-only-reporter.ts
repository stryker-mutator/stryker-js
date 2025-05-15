import os from 'os';

import { MutationTestingPlanReadyEvent } from '@stryker-mutator/api/report';

import { ProgressKeeper } from './progress-keeper.js';

export class ProgressAppendOnlyReporter extends ProgressKeeper {
  private intervalReference?: NodeJS.Timeout;

  public onMutationTestingPlanReady(
    event: MutationTestingPlanReadyEvent,
  ): void {
    super.onMutationTestingPlanReady(event);
    if (event.mutantPlans.length) {
      this.intervalReference = setInterval(() => this.render(), 10000);
    }
  }

  public onMutationTestReportReady(): void {
    if (this.intervalReference) {
      clearInterval(this.intervalReference);
    }
  }

  private render() {
    process.stdout.write(
      `Mutation testing ${this.getPercentDone()} (elapsed: ${this.getElapsedTime()}, remaining: ${this.getEtc()}) ` +
        `${this.progress.tested}/${this.progress.mutants} tested (${this.progress.survived} survived, ${this.progress.timedOut} timed out)` +
        os.EOL,
    );
  }

  private getPercentDone() {
    return `${Math.floor((this.progress.ticks / this.progress.total) * 100)}%`;
  }
}
