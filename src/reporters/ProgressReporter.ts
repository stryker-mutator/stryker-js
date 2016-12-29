import { Reporter, MatchedMutant, MutantResult, MutantStatus } from 'stryker-api/report';
import ProgressBar from './ProgressBar';
import * as chalk from 'chalk';
import * as _ from 'lodash';

export default class ProgressReporter implements Reporter {
  private progressBar: ProgressBar;
  private tickValues = {
    error: 0,
    survived: 0,
    killed: 0,
    timeout: 0,
    noCoverage: 0
  };

  onAllMutantsMatchedWithTests(matchedMutants: ReadonlyArray<MatchedMutant>): void {
    let progressBarContent: string;

    progressBarContent =
      `Mutation testing  [:bar] :percent (ETC :etas)` +
      `[:killed] ` +
      `[:survived] ` +
      `[:noCoverage] ` +
      `[:timeout] ` +
      `[:error]`;

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
    const vals = _.clone(this.tickValues);
    (vals as any).killed = `${vals.killed} ${chalk.green.bold('killed')}`;
    (vals as any).survived = `${vals.survived} ${chalk.red.bold('survived')}`;
    (vals as any).noCoverage = `${vals.noCoverage} ${chalk.red.bold('no coverage')}`;
    (vals as any).timeout = `${vals.timeout} ${chalk.yellow.bold('timeout')}`;
    (vals as any).error = `${vals.error} ${chalk.yellow.bold('error')}`;
    this.progressBar.tick(vals);
  }
}