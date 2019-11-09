import { MatchedMutant, MutantResult, Reporter } from '@stryker-mutator/api/report';
import { MutantStatus } from '@stryker-mutator/api/report';
import Timer from '../utils/Timer';

abstract class ProgressKeeper implements Reporter {
  private timer: Timer;
  protected progress = {
    survived: 0,
    timedOut: 0,
    tested: 0,
    total: 0
  };

  private mutantIdsWithoutCoverage: string[];

  public onAllMutantsMatchedWithTests(matchedMutants: readonly MatchedMutant[]): void {
    this.timer = new Timer();
    this.mutantIdsWithoutCoverage = matchedMutants.filter(m => !m.runAllTests && m.scopedTestIds.length === 0).map(m => m.id);
    this.progress.total = matchedMutants.length - this.mutantIdsWithoutCoverage.length;
  }

  public onMutantTested(result: MutantResult): void {
    if (!this.mutantIdsWithoutCoverage.some(id => result.id === id)) {
      this.progress.tested++;
    }
    if (result.status === MutantStatus.Survived) {
      this.progress.survived++;
    }
    if (result.status === MutantStatus.TimedOut) {
      this.progress.timedOut++;
    }
  }

  protected getEtc() {
    const totalSecondsLeft = Math.floor((this.timer.elapsedSeconds() / this.progress.tested) * (this.progress.total - this.progress.tested));

    if (isFinite(totalSecondsLeft) && totalSecondsLeft > 0) {
      const hours = Math.floor(totalSecondsLeft / 3600);
      const minutes = Math.floor((totalSecondsLeft / 60) % 60);
      const seconds = Math.floor(totalSecondsLeft % 60);

      return this.formatEtc(hours, minutes, seconds);
    } else {
      return 'n/a';
    }
  }

  private formatEtc(hours: number, minutes: number, seconds: number) {
    let output;

    if (hours > 0) {
      output = `${hours}h, ${minutes}m, ${seconds}s`;
    } else if (minutes > 0) {
      output = `${minutes}m, ${seconds}s`;
    } else {
      output = `${seconds}s`;
    }

    return output;
  }
}
export default ProgressKeeper;
