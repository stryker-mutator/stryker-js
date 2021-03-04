import os from 'os';

import chalk from 'chalk';
import { schema, Position, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { calculateMutationTestMetrics, MetricsResult, MutantModel, TestModel, MutationTestMetricsResult } from 'mutation-testing-metrics';
import { tokens } from 'typed-inject';

import { plural } from '../utils/string-utils';

import { ClearTextScoreTable } from './clear-text-score-table';

const { MutantStatus } = schema;

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

  public onMutationTestReportReady(report: schema.MutationTestResult): void {
    const metricsResult = calculateMutationTestMetrics(report);
    this.reportAllMutants(metricsResult);
    this.writeLine(new ClearTextScoreTable(metricsResult.systemUnderTestMetrics, this.options.thresholds).draw());
  }

  private reportAllMutants({ systemUnderTestMetrics }: MutationTestMetricsResult): void {
    this.writeLine();
    let totalTests = 0;

    // use these functions in order to preserve the 'this` pointer
    const logDebugFn = (input: string) => this.log.debug(input);
    const writeLineFn = (input: string) => this.writeLine(input);

    const reportMutants = (metrics: MetricsResult[]) => {
      metrics.forEach((child) => {
        child.file?.mutants.forEach((result) => {
          totalTests += result.testsCompleted ?? 0;
          switch (result.status) {
            case MutantStatus.Killed:
            case MutantStatus.Timeout:
            case MutantStatus.RuntimeError:
            case MutantStatus.CompileError:
              this.reportMutantResult(result, logDebugFn);
              break;
            case MutantStatus.Survived:
            case MutantStatus.NoCoverage:
              this.reportMutantResult(result, writeLineFn);
              break;
            default:
          }
        });
        reportMutants(child.childResults);
      });
    };
    reportMutants(systemUnderTestMetrics.childResults);
    this.writeLine(`Ran ${(totalTests / systemUnderTestMetrics.metrics.totalMutants).toFixed(2)} tests per mutant on average.`);
  }

  private reportMutantResult(result: MutantModel, logImplementation: (input: string) => void): void {
    logImplementation(`#${result.id}. [${MutantStatus[result.status]}] ${result.mutatorName}`);
    logImplementation(this.colorSourceFileAndLocation(result.fileName, result.location.start));

    result
      .getOriginalLines()
      .split('\n')
      .filter(Boolean)
      .forEach((line) => {
        logImplementation(chalk.red('-   ' + line));
      });
    result
      .getMutatedLines()
      .split('\n')
      .filter(Boolean)
      .forEach((line) => {
        logImplementation(chalk.green('+   ' + line));
      });
    logImplementation('');
    if (result.status === MutantStatus.Survived) {
      if (result.static) {
        logImplementation('Ran all tests for this mutant.');
      } else if (result.coveredByTests) {
        this.logExecutedTests(result.coveredByTests, logImplementation);
      }
    } else if (result.status === MutantStatus.Killed && result.killedByTests && result.killedByTests.length) {
      logImplementation(`Killed by: ${result.killedByTests[0].name}`);
    } else if (result.status === MutantStatus.RuntimeError || result.status === MutantStatus.CompileError) {
      logImplementation(`Error message: ${result.statusReason}`);
    }
  }

  private colorSourceFileAndLocation(fileName: string, position: Position): string {
    if (!this.options.clearTextReporter.allowColor) {
      return `${fileName}:${position.line}:${position.column}`;
    }

    return [chalk.cyan(fileName), chalk.yellow(`${position.line}`), chalk.yellow(`${position.column}`)].join(':');
  }

  private logExecutedTests(tests: TestModel[], logImplementation: (input: string) => void) {
    if (!this.options.clearTextReporter.logTests) {
      return;
    }

    const testCount = Math.min(this.options.clearTextReporter.maxTestsToLog, tests.length);

    if (testCount > 0) {
      logImplementation('Tests ran:');
      tests.slice(0, testCount).forEach((test) => {
        logImplementation(`    ${test.name}`);
      });
      const diff = tests.length - this.options.clearTextReporter.maxTestsToLog;
      if (diff > 0) {
        logImplementation(`  and ${diff} more test${plural(diff)}!`);
      }
      logImplementation('');
    }
  }
}
