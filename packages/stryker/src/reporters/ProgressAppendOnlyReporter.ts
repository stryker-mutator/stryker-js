import { MatchedMutant } from 'stryker-api/report';
import * as os from 'os';
import ProgressKeeper from './ProgressKeeper';

export default class ProgressAppendOnlyReporter extends ProgressKeeper {
  private intervalReference: NodeJS.Timer;

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
    process.stdout.write(`Mutation testing ${this.progress.percentDone} (ETC ${this.progress.etc}) ` +
      `${this.progress.tested}/${this.progress.total} tested (${this.progress.survived} survived)` +
      os.EOL);
  }
}
