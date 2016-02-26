'use strict';

import * as  _ from 'lodash';
import * as chalk from 'chalk';
import BaseReporter from './BaseReporter';
import Mutant, {MutantStatus} from '../Mutant';
import TestFile from '../TestFile';

/**
 * Represents a reporter which logs output to the console.
 * @constructor
 */
export default class ConsoleReporter extends BaseReporter {

  /**
   * Reports information about a Mutant that has been tested.
   * @function
   * @param mutant - The tested Mutant.
   */
  mutantTested(mutant: Mutant) {
    super.mutantTested(mutant);
    let toLog: string;
    switch (mutant.getStatus()) {
      case MutantStatus.KILLED:
        toLog = '.';
        break;
      case MutantStatus.TIMEDOUT:
        toLog = chalk.yellow('T');
        break;
      case MutantStatus.SURVIVED:
        toLog = chalk.bold.red('S');
        break;
      default:
        toLog = '';
        break;
    }

    process.stdout.write(toLog);
  }

  /**
   * Reports the final report of the mutation test including the mutation score and details about every survived Mutant.
   * @function
   * @param {Mutant[]} mutants - The tested Mutants.
   */
  allMutantsTested(mutants: Mutant[]) {
    super.allMutantsTested(mutants);
    process.stdout.write('\n'); // Write a newline character to end the string of mutant statusses.

    var mutantsKilled = 0;
    var mutantsTimedOut = 0;
    var mutantsUntested = 0;
    mutants.forEach(mutant => {
      if (mutant.hasStatusKilled()) {
        mutantsKilled++;
      } else if (mutant.hasStatusTimedOut()) {
        mutantsTimedOut++;
      } else if (mutant.hasStatusSurvived()) {
        console.log(chalk.bold.red('Mutant survived!'));
        console.log(mutant.getFilename() + ': line ' + mutant.getLineNumber() + ':' + mutant.getColumnNumber());
        console.log('Mutation: ' + mutant.getMutation().getName());
        console.log(chalk.red('-   ' + mutant.getOriginalLine()));
        console.log(chalk.green('+   ' + mutant.getMutatedLine()));
        console.log('\n');
        console.log('Tests ran: ');
        var testsRan = mutant.getTestsRan();
        _.forEach(testsRan, function(test: TestFile) {
          console.log('    ' + test.getName());
        });
        console.log('\n');
      } else if (mutant.hasStatusUntested()) {
        mutantsUntested++;
      }
    });

    var mutationScoreCodebase: string = (((mutantsKilled + mutantsTimedOut) / mutants.length) * 100).toFixed(2);
    var mutationScoreCodeCoverage: string = (((mutantsKilled + mutantsTimedOut) / (mutants.length - mutantsUntested)) * 100).toFixed(2);
    var codebaseColor = this.getColorForMutationScore(+mutationScoreCodebase);
    var codecoverageColor = this.getColorForMutationScore(+mutationScoreCodeCoverage);

    console.log((mutants.length - mutantsUntested) + ' mutants tested.');
    console.log(mutantsUntested + ' mutants untested.');
    console.log(mutantsTimedOut + ' mutants timed out.');
    console.log(mutantsKilled + ' mutants killed.');
    console.log('Mutation score based on code coverage: ' + codecoverageColor(mutationScoreCodeCoverage + '%'));
    console.log('Mutation score based on codebase: ' + codebaseColor(mutationScoreCodebase + '%'));
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

