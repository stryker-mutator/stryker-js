import { MatchedMutant } from 'stryker-api/report';
import * as os from 'os';
import ProgressKeeper from './ProgressKeeper';
import { tokens } from 'stryker-api/di';

export default class ProgressAppendOnlyReporter extends ProgressKeeper {
  private intervalReference: NodeJS.Timer;
  public static readonly inject = tokens();

  public onAllMutantsMatchedWithTests(matchedMutants: ReadonlyArray<MatchedMutant>): void {
    super.onAllMutantsMatchedWithTests(matchedMutants);
    if (matchedMutants.length) {
      this.intervalReference = setInterval(() => this.render(), 10000);
    }
  }

  public onAllMutantsTested(): void {
    clearInterval(this.intervalReference);
  }

  private render() {
    process.stdout.write(`Mutation testing ${this.getPercentDone()} (ETC ${this.getEtc()}) ` +
      `${this.progress.tested}/${this.progress.total} tested (${this.progress.survived} survived)` +
      os.EOL);
  }

  private getPercentDone() {
    return Math.floor(this.progress.tested / this.progress.total * 100) + '%';
  }
}
