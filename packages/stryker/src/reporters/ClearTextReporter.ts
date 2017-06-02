import * as chalk from 'chalk';
import * as log4js from 'log4js';
import { Reporter, MutantResult, MutantStatus, ScoreResult } from 'stryker-api/report';
import { StrykerOptions } from 'stryker-api/core';
import ClearTextScoreTable from './ClearTextScoreTable';
import * as os from 'os';

const log = log4js.getLogger('ClearTextReporter');

export default class ClearTextReporter implements Reporter {

  constructor(private options: StrykerOptions) { }

  private out: NodeJS.WritableStream = process.stdout;

  private writeLine(output?: string) {
    this.out.write(`${output || ''}${os.EOL}`);
  }

  onAllMutantsTested(mutantResults: MutantResult[]): void {
    this.writeLine();
    let totalTests = 0;

    // use these fn's in order to preserve the 'this` pointer
    const logDebugFn = (input: string) => log.debug(input);
    const writeLineFn = (input: string) => this.writeLine(input);

    mutantResults.forEach(result => {
      if (result.testsRan) {
        totalTests += result.testsRan.length;
      }
      switch (result.status) {
        case MutantStatus.Killed:
          log.debug(chalk.bold.green('Mutant killed!'));
          this.logMutantResult(result, logDebugFn);
          break;
        case MutantStatus.TimedOut:
          log.debug(chalk.bold.yellow('Mutant timed out!'));
          this.logMutantResult(result, logDebugFn);
          break;
        case MutantStatus.Error:
          log.debug(chalk.bold.yellow('Mutant caused an error!'));
          this.logMutantResult(result, logDebugFn);
          break;
        case MutantStatus.Survived:
          this.writeLine(chalk.bold.red('Mutant survived!'));
          this.logMutantResult(result, writeLineFn);
          break;
        case MutantStatus.NoCoverage:
          this.writeLine(chalk.bold.yellow('Mutant survived! (no coverage)'));
          this.logMutantResult(result, writeLineFn);
          break;
      }
    });
    this.writeLine(`Ran ${(totalTests / mutantResults.length).toFixed(2)} tests per mutant on average.`);
  }

  private logMutantResult(result: MutantResult, logImplementation: (input: string) => void): void {
    logImplementation(result.sourceFilePath + ': line ' + result.location.start.line + ':' + result.location.start.column);
    logImplementation('Mutator: ' + result.mutatorName);
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

  private logExecutedTests(result: MutantResult, logImplementation: (input: string) => void) {
    const clearTextReporterConfig = this.options['clearTextReporter'];

    if (result.testsRan && result.testsRan.length > 0) {
      let testsToLog = 3;
      if (clearTextReporterConfig && typeof clearTextReporterConfig.maxTestsToLog === 'number') {
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

  onScoreCalculated(score: ScoreResult) {
    this.writeLine(new ClearTextScoreTable(score).draw());
  }
}


