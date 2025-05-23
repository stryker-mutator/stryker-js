import { MutantResult } from '@stryker-mutator/api/core';
import { MutationTestingPlanReadyEvent } from '@stryker-mutator/api/report';

import { progressBarWrapper } from './progress-bar.js';
import { ProgressKeeper } from './progress-keeper.js';

export class ProgressBarReporter extends ProgressKeeper {
  private progressBar?: ProgressBar;

  public onMutationTestingPlanReady(
    event: MutationTestingPlanReadyEvent,
  ): void {
    super.onMutationTestingPlanReady(event);
    const progressBarContent =
      'Mutation testing  [:bar] :percent (elapsed: :et, remaining: :etc) :tested/:mutants Mutants tested (:survived survived, :timedOut timed out)';

    this.progressBar = new progressBarWrapper.ProgressBar(progressBarContent, {
      complete: '=',
      incomplete: ' ',
      stream: process.stdout,
      total: this.progress.total,
      width: 50,
    });
  }

  public onMutantTested(result: MutantResult): number {
    const ticks = super.onMutantTested(result);

    const progressBarContent = {
      ...this.progress,
      et: this.getElapsedTime(),
      etc: this.getEtc(),
    };
    if (ticks) {
      this.tick(ticks, progressBarContent);
    } else {
      this.render(progressBarContent);
    }
    return ticks;
  }

  private tick(ticks: number, tickObj: ProgressState): void {
    this.progressBar?.tick(ticks, tickObj);
  }

  private render(renderObj: ProgressState): void {
    if (this.progressBar?.total) {
      this.progressBar.render(renderObj);
    }
  }
}

interface ProgressState {
  et: string;
  etc: string;
  survived: number;
  timedOut: number;
  tested: number;
  mutants: number;
  total: number;
  ticks: number;
}
