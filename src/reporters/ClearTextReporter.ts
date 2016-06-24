import {Reporter, MutantResult, MutantStatus, SourceFile} from 'stryker-api/report';
import * as chalk from 'chalk';
import * as _ from 'lodash';

export default class ClearTextReporter implements Reporter {

  private out: NodeJS.WritableStream = process.stdout;

  private writeLine(output?: string) {
    this.out.write(`${output || ''}\n`);
  }

  onAllMutantsTested(mutantResults: MutantResult[]): void {
    this.writeLine();
    var mutantsKilled = 0;
    var mutantsTimedOut = 0;
    var mutantsUntested = 0;
    mutantResults.forEach(result => {
      switch (result.status) {
        case MutantStatus.KILLED:
          mutantsKilled++;
          break;
        case MutantStatus.TIMEDOUT:
          mutantsTimedOut++;
          break;
        case MutantStatus.SURVIVED:
          this.writeLine(chalk.bold.red('Mutant survived!'));
          this.writeLine(result.sourceFilePath + ': line ' + result.location.start.line + ':' + result.location.start.column);
          this.writeLine('Mutator: ' + result.mutatorName);
          this.writeLine(chalk.red('-   ' + result.originalLines));
          this.writeLine(chalk.green('+   ' + result.mutatedLines));
          this.writeLine('\n');
          this.writeLine('Tests ran: ');
          _.forEach(result.specsRan, (spec: string) => {
            this.writeLine('    ' + spec);
          });
          this.writeLine('\n');
          break;
        case MutantStatus.UNTESTED:
          mutantsUntested++;
          break;
      }
    });

    var mutationScoreCodebase: string = (((mutantsKilled + mutantsTimedOut) / mutantResults.length) * 100).toFixed(2);
    var mutationScoreCodeCoverage: string = (((mutantsKilled + mutantsTimedOut) / ((mutantResults.length - mutantsUntested) || 1)) * 100).toFixed(2);
    var codebaseColor = this.getColorForMutationScore(+mutationScoreCodebase);
    var codecoverageColor = this.getColorForMutationScore(+mutationScoreCodeCoverage);

    this.writeLine((mutantResults.length - mutantsUntested) + ' mutants tested.');
    this.writeLine(mutantsUntested + ' mutants untested.');
    this.writeLine(mutantsTimedOut + ' mutants timed out.');
    this.writeLine(mutantsKilled + ' mutants killed.');
    this.writeLine('Mutation score based on covered code: ' + codecoverageColor(mutationScoreCodeCoverage + '%'));
    this.writeLine('Mutation score based on all code: ' + codebaseColor(mutationScoreCodebase + '%'));
  }

  /**
   * Gets the color associated with a mutation score.
   * @function
   * @param score - The mutation score.
   * @returns {Function} The function which can give the mutation score the right color.
   */
  private getColorForMutationScore(score: number) {
    var color: chalk.ChalkChain;
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


