import { MatchedMutant, Reporter, MutantResult } from 'stryker-api/report';
import { MutantStatus } from 'stryker-api/report';
import Timer from '../utils/Timer';

abstract class ProgressKeeper implements Reporter {
  private timer: Timer;
  protected progress = {
    survived: 0,
    tested: 0,
    total: 0,
  };

  private mutantIdsWithoutCoverage: string[];

  public onAllMutantsMatchedWithTests(matchedMutants: ReadonlyArray<MatchedMutant>): void {
    this.timer = new Timer();
    this.mutantIdsWithoutCoverage = matchedMutants.filter(m => m.scopedTestIds.length === 0).map(m => m.id);
    this.progress.total = matchedMutants.length - this.mutantIdsWithoutCoverage.length;
  }

  public onMutantTested(result: MutantResult): void {
    if (!this.mutantIdsWithoutCoverage.some(id => result.id === id)) {
      this.progress.tested++;
    }
    if (result.status === MutantStatus.Survived) {
      this.progress.survived++;
    }
  }

  protected getEtc() {
    const timeLeft = Math.floor(this.timer.elapsedSeconds() / this.progress.tested * (this.progress.total - this.progress.tested));

    if (isFinite(timeLeft)) {
      const hours = Math.floor(timeLeft / 3600);
      const minutes = Math.floor((timeLeft / 60) - (hours * 60));
      const seconds = Math.floor(timeLeft - (hours * 3600) - (minutes * 60));

      let output = (hours !== 0) ? `${hours}h, ` : '';
      output += (minutes !== 0) ? `${minutes}m, ` : '';
      output += (seconds !== 0) ? `${seconds}s` : 0;

      return output;
    } else {
      return 'n/a';
    }
  }
}
export default ProgressKeeper;
