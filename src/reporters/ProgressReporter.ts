import {Reporter, MutantResult, MutantStatus} from 'stryker-api/report';
import * as chalk from 'chalk';

export default class ProgressReporter implements Reporter {
  onMutantTested(result: MutantResult) {
    let toLog: string;
    switch (result.status) {
      case MutantStatus.Killed:
        toLog = '.';
        break;
      case MutantStatus.TimedOut:
        toLog = chalk.yellow('T');
        break;
      case MutantStatus.Survived:
        toLog = chalk.bold.red('S');
        break;
      case MutantStatus.Error:
        toLog = chalk.yellow('E');
        break;
      default:
        toLog = '';
        break;
    }
    process.stdout.write(toLog);
  }
}