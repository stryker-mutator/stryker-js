import { MatchedMutant, MutantResult } from 'stryker-api/report';
import ProgressKeeper from './ProgressKeeper';
import ProgressBar from './ProgressBar';

export default class ProgressBarReporter extends ProgressKeeper {
  private progressBar: ProgressBar;

  public onAllMutantsMatchedWithTests(matchedMutants: ReadonlyArray<MatchedMutant>): void {
    super.onAllMutantsMatchedWithTests(matchedMutants);
    const progressBarContent =
      `Mutation testing  [:bar] :percent (ETC :etas) :tested/:total tested (:survived survived)`;

    this.progressBar = new ProgressBar(progressBarContent, {
      complete: '=',
      incomplete: ' ',
      stream: process.stdout,
      total: this.progress.total,
      width: 50
    });
  }

  public onMutantTested(result: MutantResult): void {
    const ticksBefore = this.progress.tested;
    super.onMutantTested(result);
    if (ticksBefore < this.progress.tested) {
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
