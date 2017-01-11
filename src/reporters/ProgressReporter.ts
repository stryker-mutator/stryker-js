import { MatchedMutant, MutantResult, MutantStatus } from 'stryker-api/report';
import ProgressKeeper from './ProgressKeeper';
import ProgressBar from './ProgressBar';
import * as chalk from 'chalk';

export default class ProgressBarReporter extends ProgressKeeper {
  private progressBar: ProgressBar;

  onAllMutantsMatchedWithTests(matchedMutants: ReadonlyArray<MatchedMutant>): void {
    super.onAllMutantsMatchedWithTests(matchedMutants);
    const progressBarContent =
      `Mutation testing  [:bar] :percent (ETC :etas)` +
      `[:killed :killedLabel] ` +
      `[:survived :survivedLabel] ` +
      `[:noCoverage :noCoverageLabel] ` +
      `[:timeout :timeoutLabel] ` +
      `[:error :errorLabel]`;

    this.progressBar = new ProgressBar(progressBarContent, {
      width: 50,
      complete: '=',
      incomplete: ' ',
      stream: process.stdout,
      total: this.progress.totalCount
    });
  }

  onMutantTested(result: MutantResult): void {
    const ticksBefore = this.progress.testedCount;
    super.onMutantTested(result);
    if (ticksBefore < this.progress.testedCount) {
      this.tick();
    } else {
      this.render();
    }
  }

  private tick(): void {
    this.progressBar.tick(this.progress);
  }

  private render(): void {
    this.progressBar.render(this.progress);
  }
}