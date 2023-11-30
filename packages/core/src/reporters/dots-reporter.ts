import os from 'os';

import chalk from 'chalk';
import { Reporter } from '@stryker-mutator/api/report';
import type { MutantResult } from '@stryker-mutator/api/core';

export class DotsReporter implements Reporter {
  public onMutantTested(result: MutantResult): void {
    let toLog: string;
    switch (result.status) {
      case 'Killed':
        toLog = '.';
        break;
      case 'Timeout':
        toLog = chalk.yellow('T');
        break;
      case 'Survived':
        toLog = chalk.bold.red('S');
        break;
      case 'RuntimeError':
        toLog = chalk.yellow('E');
        break;
      default:
        toLog = '';
        break;
    }
    process.stdout.write(toLog);
  }

  public onMutationTestReportReady(): void {
    process.stdout.write(os.EOL);
  }
}
