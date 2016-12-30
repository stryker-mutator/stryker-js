import { Reporter, MatchedMutant, MutantResult, MutantStatus } from 'stryker-api/report';
import ProgressBar from './ProgressBar';
import * as chalk from 'chalk';

export default class ProgressReporter implements Reporter {
  private progressBar: ProgressBar;

  // tickValues contains Labels, because on initation of the ProgressBar the width is determined based on the amount of characters of the progressBarContent inclusive ASCII-codes for colors
  private tickValues = {
    error: 0,
    survived: 0,
    killed: 0,
    timeout: 0,
    noCoverage: 0,
    killedLabel: chalk.green.bold('killed'),
    survivedLabel: chalk.red.bold('survived'),
    noCoverageLabel: chalk.red.bold('no coverage'),
    timeoutLabel: chalk.yellow.bold('timeout'),
    errorLabel: chalk.yellow.bold('error')
  };

  onAllMutantsMatchedWithTests(matchedMutants: ReadonlyArray<MatchedMutant>): void {
    let progressBarContent: string;

    progressBarContent =
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
      total: matchedMutants.filter(m => m.scopedTestIds.length > 0).length
    });
  }

  onMutantTested(result: MutantResult): void {
    switch (result.status) {
      case MutantStatus.NoCoverage:
        this.tickValues.noCoverage++;
        this.progressBar.render(this.tickValues);
        break;
      case MutantStatus.Killed:
        this.tickValues.killed++;
        this.tick();
        break;
      case MutantStatus.Survived:
        this.tickValues.survived++;
        this.tick();
        break;
      case MutantStatus.TimedOut:
        this.tickValues.timeout++;
        this.tick();
        break;
      case MutantStatus.Error:
        this.tickValues.error++;
        this.tick();
        break;
    }
  }

  tick(): void {
    this.progressBar.tick(this.tickValues);
  }
}