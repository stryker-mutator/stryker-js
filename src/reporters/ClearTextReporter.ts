import {Reporter, MutantResult, MutantStatus, SourceFile} from 'stryker-api/report';
import * as chalk from 'chalk';
import * as _ from 'lodash';
import * as log4js from 'log4js';

const log = log4js.getLogger('ClearTextReporter');

export default class ClearTextReporter implements Reporter {

  private out: NodeJS.WritableStream = process.stdout;

  private writeLine(output?: string) {
    this.out.write(`${output || ''}\n`);
  }

  onAllMutantsTested(mutantResults: MutantResult[]): void {
    this.writeLine();
    let mutantsKilled = 0;
    let mutantsTimedOut = 0;
    let mutantsNoCoverage = 0;

    // use these fn's in order to preserve the 'this` pointer
    let logDebugFn = (input: string) => log.debug(input); 
    let writeLineFn = (input: string) => this.writeLine(input);

    mutantResults.forEach(result => {
      switch (result.status) {
        case MutantStatus.Killed:
          mutantsKilled++;
          log.debug(chalk.bold.green('Mutant killed!'));
          this.logMutantResult(result, logDebugFn);
          break;
        case MutantStatus.TimedOut:
          mutantsTimedOut++;
          log.debug(chalk.bold.yellow('Mutant timed out!'));
          this.logMutantResult(result, logDebugFn);
          break;
        case MutantStatus.Survived:
          this.writeLine(chalk.bold.red('Mutant survived!'));
          this.logMutantResult(result, writeLineFn);
          break;
        case MutantStatus.NoCoverage:
          mutantsNoCoverage++;
          log.debug(chalk.bold.yellow('Mutant not covered!'));
          this.logMutantResult(result, logDebugFn);
          break;
      }
    });

    const mutationScoreCodebase: string = (((mutantsKilled + mutantsTimedOut) / mutantResults.length) * 100).toFixed(2);
    const mutationScoreCodeCoverage: string = (((mutantsKilled + mutantsTimedOut) / ((mutantResults.length - mutantsNoCoverage) || 1)) * 100).toFixed(2);
    const codebaseColor = this.getColorForMutationScore(+mutationScoreCodebase);
    const codecoverageColor = this.getColorForMutationScore(+mutationScoreCodeCoverage);

    this.writeLine((mutantResults.length - mutantsNoCoverage) + ' mutants tested.');
    this.writeLine(mutantsNoCoverage + ' mutants not covered.');
    this.writeLine(mutantsTimedOut + ' mutants timed out.');
    this.writeLine(mutantsKilled + ' mutants killed.');
    this.writeLine('Mutation score based on covered code: ' + codecoverageColor(mutationScoreCodeCoverage + '%'));
    this.writeLine('Mutation score based on all code: ' + codebaseColor(mutationScoreCodebase + '%'));
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
    if (result.testsRan && result.testsRan.length > 0) {
      logImplementation('Tests ran: ');
      _.forEach(result.testsRan, (spec: string) => {
        logImplementation('    ' + spec);
      });
      logImplementation('');
    }
  }

  /**
   * Gets the color associated with a mutation score.
   * @function
   * @param score - The mutation score.
   * @returns {Function} The function which can give the mutation score the right color.
   */
  private getColorForMutationScore(score: number) {
    let color: chalk.ChalkChain;
    if (score > 80) {
      color = chalk.green;
    } else if (score > 50) {
      color = chalk.yellow;
    } else {
      color = chalk.red;
    }
    return color;
  }
}


