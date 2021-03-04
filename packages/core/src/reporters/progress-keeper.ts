import { MutantResult, MutantStatus, MutantTestCoverage } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/report';

import { Timer } from '../utils/timer';

function mutantHasCoverage(mutant: Pick<MutantResult, 'coveredBy' | 'static'>) {
  return !!mutant.static || !!mutant.coveredBy?.length;
}

export abstract class ProgressKeeper implements Reporter {
  private timer!: Timer;
  protected progress = {
    survived: 0,
    timedOut: 0,
    tested: 0,
    total: 0,
  };

  public onAllMutantsMatchedWithTests(mutants: readonly MutantTestCoverage[]): void {
    this.timer = new Timer();
    this.progress.total = mutants.filter(mutantHasCoverage).length;
  }

  public onMutantTested(result: MutantResult): void {
    if (mutantHasCoverage(result)) {
      this.progress.tested++;
    }
    if (result.status === MutantStatus.Survived) {
      this.progress.survived++;
    }
    if (result.status === MutantStatus.Timeout) {
      this.progress.timedOut++;
    }
  }

  protected getElapsedTime(): string {
    return this.formatTime(this.timer.elapsedSeconds());
  }

  protected getEtc(): string {
    const totalSecondsLeft = Math.floor((this.timer.elapsedSeconds() / this.progress.tested) * (this.progress.total - this.progress.tested));

    if (isFinite(totalSecondsLeft) && totalSecondsLeft > 0) {
      return this.formatTime(totalSecondsLeft);
    } else {
      return 'n/a';
    }
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
