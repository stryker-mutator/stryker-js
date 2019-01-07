import {Reporter, MutantResult, MutantStatus} from 'stryker-api/report';
import chalk from 'chalk';
import * as os from 'os';
import { tokens } from 'stryker-api/di';

export default class DotsReporter implements Reporter {
  public static readonly inject = tokens();

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
        break;
    }
    process.stdout.write(toLog);
  }

  public onAllMutantsTested(): void {
    process.stdout.write(os.EOL);
  }
}
