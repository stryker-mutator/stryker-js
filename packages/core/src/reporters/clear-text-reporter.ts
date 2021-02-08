import os from 'os';

import chalk from 'chalk';
import { Position, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { MutantResult, MutantStatus, mutationTestReportSchema, Reporter, UndetectedMutantResult } from '@stryker-mutator/api/report';
import { calculateMetrics } from 'mutation-testing-metrics';
import { tokens } from 'typed-inject';

import { ClearTextScoreTable } from './clear-text-score-table';

export class ClearTextReporter implements Reporter {
  public static inject = tokens(commonTokens.logger, commonTokens.options);
  constructor(private readonly log: Logger, private readonly options: StrykerOptions) {
    this.configConsoleColor();
  }

  private readonly out: NodeJS.WritableStream = process.stdout;

  private writeLine(output?: string) {
    this.out.write(`${output ?? ''}${os.EOL}`);
  }

  private configConsoleColor() {
    if (!this.options.allowConsoleColors) {
      chalk.level = 0; // All colors disabled
    }
  }

  public onAllMutantsTested(mutantResults: MutantResult[]): void {
    this.writeLine();
    let totalTests = 0;

    // use these functions in order to preserve the 'this` pointer
    const logDebugFn = (input: string) => this.log.debug(input);
    const writeLineFn = (input: string) => this.writeLine(input);

    mutantResults.forEach((result) => {
      totalTests += result.nrOfTestsRan;
      switch (result.status) {
        case MutantStatus.Killed:
        case MutantStatus.TimedOut:
        case MutantStatus.RuntimeError:
        case MutantStatus.CompileError:
          this.logMutantResult(result, logDebugFn);
          break;
        case MutantStatus.Survived:
        case MutantStatus.NoCoverage:
          this.logMutantResult(result, writeLineFn);
          break;
        default:
      }
    });
    this.writeLine(`Ran ${(totalTests / mutantResults.length).toFixed(2)} tests per mutant on average.`);
  }

  private logMutantResult(result: MutantResult, logImplementation: (input: string) => void): void {
    logImplementation(`#${result.id}. [${MutantStatus[result.status]}] ${result.mutatorName}`);
    logImplementation(this.colorSourceFileAndLocation(result.fileName, result.location.start));

    result.originalLines.split('\n').forEach((line) => {
      logImplementation(chalk.red('-   ' + line));
    });
    result.mutatedLines.split('\n').forEach((line) => {
      logImplementation(chalk.green('+   ' + line));
    });
    logImplementation('');
    if (result.status === MutantStatus.Survived) {
      if (this.options.coverageAnalysis === 'perTest' && result.testFilter) {
        this.logExecutedTests(result, logImplementation);
      } else {
        logImplementation('Ran all tests for this mutant.');
      }
    } else if (result.status === MutantStatus.Killed) {
      logImplementation(`Killed by: ${result.killedBy}`);
    } else if (result.status === MutantStatus.RuntimeError || result.status === MutantStatus.CompileError) {
      logImplementation(`Error message: ${result.errorMessage}`);
    }
  }

  private colorSourceFileAndLocation(fileName: string, position: Position): string {
    if (!this.options.clearTextReporter.allowColor) {
      return `${fileName}:${position.line}:${position.column}`;
    }

    return [chalk.cyan(fileName), chalk.yellow(`${position.line}`), chalk.yellow(`${position.column}`)].join(':');
  }

  private logExecutedTests(result: UndetectedMutantResult, logImplementation: (input: string) => void) {
    if (!this.options.clearTextReporter.logTests) {
      return;
    }

    if (result.nrOfTestsRan > 0) {
      const { maxTestsToLog } = this.options.clearTextReporter;

      if (maxTestsToLog > 0) {
        logImplementation('Tests ran:');
        for (let i = 0; i < maxTestsToLog; i++) {
          if (i > result.testFilter!.length - 1) {
            break;
          }
          logImplementation(`    ${result.testFilter![i]}`);
        }
        const diff = result.testFilter!.length - maxTestsToLog;
        if (diff > 0) {
          const plural = diff === 1 ? '' : 's';
          logImplementation(`  and ${diff} more test${plural}!`);
        }
        logImplementation('');
      }
    }
  }

  public onMutationTestReportReady(report: mutationTestReportSchema.MutationTestResult): void {
    const metricsResult = calculateMetrics(report.files);
    this.writeLine(new ClearTextScoreTable(metricsResult, this.options.thresholds).draw());
  }
}
