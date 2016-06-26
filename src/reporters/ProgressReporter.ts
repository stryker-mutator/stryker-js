import {Reporter, MutantResult, MutantStatus} from 'stryker-api/report';
import * as chalk from 'chalk';

export default class ProgressReporter implements Reporter {
  onMutantTested(result: MutantResult) {
    let toLog: string;
    switch (result.status) {
      case MutantStatus.KILLED:
        toLog = '.';
        break;
      case MutantStatus.TIMEDOUT:
        toLog = chalk.yellow('T');
        break;
      case MutantStatus.SURVIVED:
        toLog = chalk.bold.red('S');
        break;
      default:
        toLog = '';
        break;
    }
    process.stdout.write(toLog);
  }
}