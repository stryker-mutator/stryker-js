import {Reporter, MutantResult, MutantStatus} from 'stryker-api/report';
import chalk from 'chalk';
import * as os from 'os';

export default class DotsReporter implements Reporter {
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
      case MutantStatus.RuntimeError:
        toLog = chalk.yellow('E');
        break;
      default:
        toLog = '';
        break;
    }
    process.stdout.write(toLog);
  }

  onAllMutantsTested(): void {
    process.stdout.write(os.EOL);
  }
}