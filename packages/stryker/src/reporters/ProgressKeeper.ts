import * as chalk from 'chalk';
import { MatchedMutant, Reporter, MutantResult, MutantStatus } from 'stryker-api/report';

abstract class ProgressKeeper implements Reporter {

  // progress contains Labels, because on initation of the ProgressBar the width is determined based on the amount of characters of the progressBarContent inclusive ASCII-codes for colors
  protected progress = {
    error: 0,
    survived: 0,
    killed: 0,
    timeout: 0,
    noCoverage: 0,
    testedCount: 0,
    totalCount: 0,
    killedLabel: chalk.green.bold('killed'),
    survivedLabel: chalk.red.bold('survived'),
    noCoverageLabel: chalk.red.bold('no coverage'),
    timeoutLabel: chalk.yellow.bold('timeout'),
    errorLabel: chalk.yellow.bold('error')
  };

  onAllMutantsMatchedWithTests(matchedMutants: ReadonlyArray<MatchedMutant>): void {
    this.progress.totalCount = matchedMutants.filter(m => m.scopedTestIds.length > 0).length;
  }
  
  onMutantTested(result: MutantResult): void {
    this.progress.testedCount++;
    switch (result.status) {
      case MutantStatus.NoCoverage:
        this.progress.testedCount--; // correct for not tested, because no coverage
        this.progress.noCoverage++;
        break;
      case MutantStatus.Killed:
        this.progress.killed++;
        break;
      case MutantStatus.Survived:
        this.progress.survived++;
        break;
      case MutantStatus.TimedOut:
        this.progress.timeout++;
        break;
      case MutantStatus.Error:
        this.progress.error++;
        break;
    }
  }

}
export default ProgressKeeper;