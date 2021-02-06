import os from 'os';

import { MutantResult, MutantStatus, Reporter } from '@stryker-mutator/api/report';

import chalk from 'chalk';

export class DotsReporter implements Reporter {
  public onMutantTested(result: MutantResult): void {
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
