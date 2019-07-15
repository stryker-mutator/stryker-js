import { Position, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import { MutantResult, MutantStatus, mutationTestReportSchema, Reporter } from '@stryker-mutator/api/report';
import chalk from 'chalk';
import { calculateMetrics } from 'mutation-testing-metrics';
import * as os from 'os';
import { tokens } from 'typed-inject';
import ClearTextScoreTable from './ClearTextScoreTable';

export default class ClearTextReporter implements Reporter {

  public static inject = tokens(COMMON_TOKENS.logger, COMMON_TOKENS.options);
  constructor(private readonly log: Logger, private readonly options: StrykerOptions) {
    this.configConsoleColor();
  }

  private readonly out: NodeJS.WritableStream = process.stdout;

  private writeLine(output?: string) {
    this.out.write(`${output || ''}${os.EOL}`);
  }

  private configConsoleColor() {
    if (!this.options.allowConsoleColors) {
      chalk.level = 0; // All colors disabled
    }
  }

  public onAllMutantsTested(mutantResults: MutantResult[]): void {
    this.writeLine();
    let totalTests = 0;

    // use these fn's in order to preserve the 'this` pointer
    const logDebugFn = (input: string) => this.log.debug(input);
    const writeLineFn = (input: string) => this.writeLine(input);

    mutantResults.forEach((result, index) => {
      if (result.testsRan) {
        totalTests += result.testsRan.length;
      }
      switch (result.status) {
        case MutantStatus.Killed:
          this.log.debug(chalk.bold.green('Mutant killed!'));
          this.logMutantResult(result, index, logDebugFn);
          break;
        case MutantStatus.TimedOut:
          this.log.debug(chalk.bold.yellow('Mutant timed out!'));
          this.logMutantResult(result, index, logDebugFn);
          break;
        case MutantStatus.RuntimeError:
          this.log.debug(chalk.bold.yellow('Mutant caused a runtime error!'));
          this.logMutantResult(result, index, logDebugFn);
          break;
        case MutantStatus.TranspileError:
          this.log.debug(chalk.bold.yellow('Mutant caused a transpile error!'));
          this.logMutantResult(result, index, logDebugFn);
          break;
        case MutantStatus.Survived:
          this.logMutantResult(result, index, writeLineFn);
          break;
        case MutantStatus.NoCoverage:
          this.logMutantResult(result, index, writeLineFn);
          break;
      }
    });
    this.writeLine(`Ran ${(totalTests / mutantResults.length).toFixed(2)} tests per mutant on average.`);
  }

  private logMutantResult(result: MutantResult, index: number, logImplementation: (input: string) => void): void {
    logImplementation(`${index}. [${MutantStatus[result.status]}] ${result.mutatorName}`);
    logImplementation(this.colorSourceFileAndLocation(result.sourceFilePath, result.location.start));

    result.originalLines.split('\n').forEach(line => {
      logImplementation(chalk.red('-   ' + line));
    });
    result.mutatedLines.split('\n').forEach(line => {
      logImplementation(chalk.green('+   ' + line));
    });
    logImplementation('');
    if (this.options.coverageAnalysis === 'perTest') {
      this.logExecutedTests(result, logImplementation);
    } else if (result.testsRan && result.testsRan.length > 0) {
      logImplementation('Ran all tests for this mutant.');
    }
  }

  private colorSourceFileAndLocation(sourceFilePath: string, position: Position): string {
    const clearTextReporterConfig = this.options.clearTextReporter;

    if (clearTextReporterConfig && clearTextReporterConfig.allowColor !== false) {
      return sourceFilePath + ':' + position.line + ':' + position.column;
    }

    return [
      chalk.cyan(sourceFilePath),
      chalk.yellow(`${position.line}`),
      chalk.yellow(`${position.column}`),
    ].join(':');
  }

  private logExecutedTests(result: MutantResult, logImplementation: (input: string) => void) {
    const clearTextReporterConfig = this.options.clearTextReporter || {};

    if (!clearTextReporterConfig.logTests) {
      return;
    }

    if (result.testsRan && result.testsRan.length > 0) {
      let testsToLog = 3;
      if (typeof clearTextReporterConfig.maxTestsToLog === 'number') {
        testsToLog = clearTextReporterConfig.maxTestsToLog;
      }

      if (testsToLog > 0) {
        logImplementation('Tests ran: ');
        for (let i = 0; i < testsToLog; i++) {
          if (i > result.testsRan.length - 1) {
            break;
          }

          logImplementation('    ' + result.testsRan[i]);
        }
        if (testsToLog < result.testsRan.length) {
          logImplementation(`  and ${result.testsRan.length - testsToLog} more tests!`);
        }
        logImplementation('');
      }
    }
  }

  public onMutationTestReportReady(report: mutationTestReportSchema.MutationTestResult) {
    const metricsResult = calculateMetrics(report.files);
    this.writeLine(new ClearTextScoreTable(metricsResult, this.options.thresholds).draw());
  }
}
