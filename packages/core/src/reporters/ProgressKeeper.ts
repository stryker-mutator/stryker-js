import { MatchedMutant, MutantResult, Reporter } from '@stryker-mutator/api/report';
import { MutantStatus } from '@stryker-mutator/api/report';

import Timer from '../utils/Timer';

abstract class ProgressKeeper implements Reporter {
  private timer: Timer;
  protected progress = {
    survived: 0,
    timedOut: 0,
    tested: 0,
    total: 0,
  };

  private mutantIdsWithoutCoverage: string[];

  public onAllMutantsMatchedWithTests(matchedMutants: readonly MatchedMutant[]): void {
    this.timer = new Timer();
    this.mutantIdsWithoutCoverage = matchedMutants.filter((m) => !m.runAllTests && !m.testFilter?.length).map((m) => m.id);
    this.progress.total = matchedMutants.length - this.mutantIdsWithoutCoverage.length;
  }

  public onMutantTested(result: MutantResult): void {
    if (!this.mutantIdsWithoutCoverage.some((id) => result.id === id)) {
      this.progress.tested++;
    }
    if (result.status === MutantStatus.Survived) {
      this.progress.survived++;
    }
    if (result.status === MutantStatus.TimedOut) {
      this.progress.timedOut++;
    }
  }

  protected getElapsedTime() {
    return this.formatTime(this.timer.elapsedSeconds());
  }

  protected getEtc() {
    const totalSecondsLeft = Math.floor((this.timer.elapsedSeconds() / this.progress.tested) * (this.progress.total - this.progress.tested));

    if (isFinite(totalSecondsLeft) && totalSecondsLeft > 0) {
      return this.formatTime(totalSecondsLeft);
    }
    return 'n/a';
  }

  private formatTime(timeInSeconds: number) {
    const hours = Math.floor(timeInSeconds / 3600);

    const minutes = Math.floor((timeInSeconds % 3600) / 60);

    return hours > 0 // conditional time formatting
      ? `~${hours}h ${minutes}m`
      : minutes > 0
      ? `~${minutes}m`
      : '<1m';
  }
}
export default ProgressKeeper;
