import chalk from 'chalk';
import * as os from 'os';
import { MutantResult, MutantStatus, Reporter } from 'stryker-api/report';

export default class DotsReporter implements Reporter {

  public onAllMutantsTested(): void {
    process.stdout.write(os.EOL);
  }
  public onMutantTested(result: MutantResult) {
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
    }
    process.stdout.write(toLog);
  }
}
