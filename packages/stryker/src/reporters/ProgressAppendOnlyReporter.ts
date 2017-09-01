import { MatchedMutant } from 'stryker-api/report';
import * as os from 'os';
import ProgressKeeper from './ProgressKeeper';
import Timer from '../utils/Timer';

export default class ProgressAppendOnlyReporter extends ProgressKeeper {
  private intervalReference: NodeJS.Timer;
  private timer: Timer;

  onAllMutantsMatchedWithTests(matchedMutants: ReadonlyArray<MatchedMutant>): void {
    super.onAllMutantsMatchedWithTests(matchedMutants);
    this.timer = new Timer();
    this.intervalReference = setInterval(() => this.render(), 10000);
  }

  onAllMutantsTested(): void {
    clearInterval(this.intervalReference);
  }

  private render() {
    process.stdout.write(`Mutation testing ${this.procent()} (ETC ${this.etc()}) ` +
      `[${this.progress.killed} ${this.progress.killedLabel}] ` +
      `[${this.progress.survived} ${this.progress.survivedLabel}] ` +
      `[${this.progress.noCoverage} ${this.progress.noCoverageLabel}] ` +
      `[${this.progress.timeout} ${this.progress.timeoutLabel}] ` +
      `[${this.progress.runtimeError} ${this.progress.runtimeErrorLabel}] ` +
      `[${this.progress.transpileError} ${this.progress.transpileErrorLabel}]` +
      os.EOL);
  }

  private procent() {
    return Math.floor(this.progress.testedCount / this.progress.totalCount * 100) + '%';
  }

  private etc() {
    const etcSeconds = Math.floor(this.timer.elapsedSeconds() / this.progress.testedCount * (this.progress.totalCount - this.progress.testedCount));
    if (isFinite(etcSeconds)) {
      return etcSeconds + 's';
    } else {
      return 'n/a';
    }
  }
}