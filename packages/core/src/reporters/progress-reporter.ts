import { MatchedMutant, MutantResult } from '@stryker-mutator/api/report';

import { ProgressBar } from './progress-bar';
import { ProgressKeeper } from './progress-keeper';

export class ProgressBarReporter extends ProgressKeeper {
  private progressBar?: ProgressBar;

  public onAllMutantsMatchedWithTests(matchedMutants: readonly MatchedMutant[]): void {
    super.onAllMutantsMatchedWithTests(matchedMutants);
    const progressBarContent =
      'Mutation testing  [:bar] :percent (elapsed: :et, remaining: :etc) :tested/:total tested (:survived survived, :timedOut timed out)';

    this.progressBar = new ProgressBar(progressBarContent, {
      complete: '=',
      incomplete: ' ',
      stream: process.stdout,
      total: this.progress.total,
      width: 50,
    });
  }

  public onMutantTested(result: MutantResult): void {
    const ticksBefore = this.progress.tested;
    super.onMutantTested(result);

    const progressBarContent = { ...this.progress, et: this.getElapsedTime(), etc: this.getEtc() };

    if (ticksBefore < this.progress.tested) {
      this.tick(progressBarContent);
    } else {
      this.render(progressBarContent);
    }
  }

  private tick(tickObj: Record<string, unknown>): void {
    this.progressBar?.tick(tickObj);
  }

  private render(renderObj: Record<string, unknown>): void {
    this.progressBar?.render(renderObj);
  }
}
