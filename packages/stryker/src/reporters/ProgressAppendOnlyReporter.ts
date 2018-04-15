import { MatchedMutant } from 'stryker-api/report';
import * as os from 'os';
import ProgressKeeper from './ProgressKeeper';
import Timer from '../utils/Timer';

export default class ProgressAppendOnlyReporter extends ProgressKeeper {
  private intervalReference: NodeJS.Timer;
  private timer: Timer;

  onAllMutantsMatchedWithTests(matchedMutants: ReadonlyArray<MatchedMutant>): void {
    super.onAllMutantsMatchedWithTests(matchedMutants);
    if (matchedMutants.length) {
      this.timer = new Timer();
      this.intervalReference = setInterval(() => this.render(), 10000);
    }
  }

  onAllMutantsTested(): void {
    clearInterval(this.intervalReference);
  }

  private render() {
    process.stdout.write(`Mutation testing ${this.percent()} (ETC ${this.etc()}) ` +
      `${this.progress.tested}/${this.progress.total} tested (${this.progress.survived} survived)` +
      os.EOL);
  }

  private percent() {
    return Math.floor(this.progress.tested / this.progress.total * 100) + '%';
  }

  private etc() {
    const etcSeconds = Math.floor(this.timer.elapsedSeconds() / this.progress.tested * (this.progress.total - this.progress.tested));
    if (isFinite(etcSeconds)) {
      return etcSeconds + 's';
    } else {
      return 'n/a';
    }
  }
}