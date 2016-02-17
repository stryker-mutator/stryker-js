'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var util = require('util');
import BaseReporter from './BaseReporter';

/**
 * Represents a reporter which logs output to the console.
 * @constructor
 */
function ConsoleReporter() {
  BaseReporter.call(this);
}

util.inherits(ConsoleReporter, BaseReporter);

/**
 * Reports information about a Mutant that has been tested.
 * @function
 * @param {Mutant} mutant - The tested Mutant.
 */
ConsoleReporter.prototype.mutantTested = function(mutant) {
  BaseReporter.prototype.mutantTested.call(this, mutant);
  var mutantStatus = '';
  if (mutant.hasStatusKilled()) {
    mutantStatus = '.';
  } else if (mutant.hasStatusTimedOut()) {
    mutantStatus = chalk.yellow('T');
  } else if (mutant.hasStatusSurvived()) {
    mutantStatus = chalk.bold.red('S');
  }

  process.stdout.write(mutantStatus);
};

/**
 * Reports the final report of the mutation test including the mutation score and details about every survived Mutant.
 * @function
 * @param {Mutant[]} mutants - The tested Mutants.
 */
ConsoleReporter.prototype.allMutantsTested = function(mutants) {
  BaseReporter.prototype.allMutantsTested.call(this, mutants);
  process.stdout.write('\n'); // Write a newline character to end the string of mutant statusses.

  var mutantsKilled = 0;
  var mutantsTimedOut = 0;
  var mutantsUntested = 0;
  _.forEach(mutants, function(mutant) {
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
      _.forEach(testsRan, function(test) {
        console.log('    ' + test.getName());
      });
      console.log('\n');
    } else if (mutant.hasStatusUntested()) {
      mutantsUntested++;
    }
  });

  var mutationScoreCodebase = (((mutantsKilled + mutantsTimedOut) / mutants.length) * 100).toFixed(2);
  var mutationScoreCodeCoverage = (((mutantsKilled + mutantsTimedOut) / (mutants.length - mutantsUntested)) * 100).toFixed(2);
  var codebaseColor = this._getColorForMutationScore(mutationScoreCodebase);
  var codecoverageColor = this._getColorForMutationScore(mutationScoreCodeCoverage);

  console.log((mutants.length - mutantsUntested) + ' mutants tested.');
  console.log(mutantsUntested + ' mutants untested.');
  console.log(mutantsTimedOut + ' mutants timed out.');
  console.log(mutantsKilled + ' mutants killed.');
  console.log('Mutation score based on code coverage: ' + codecoverageColor(mutationScoreCodeCoverage + '%'));
  console.log('Mutation score based on codebase: ' + codebaseColor(mutationScoreCodebase + '%'));
};

/**
 * Gets the color associated with a mutation score.
 * @function
 * @param {String} score - The mutation score.
 * @returns {Function} The function which can give the mutation score the right color.
 */
ConsoleReporter.prototype._getColorForMutationScore = function(score) {
  this._typeUtils.expectParameterString(score, 'BaseReporter', 'score');

  var color;
  if (score > 80) {
    color = chalk.green;
  } else if (score > 50) {
    color = chalk.yellow;
  } else {
    color = chalk.red;
  }

  return color;
};

module.exports = ConsoleReporter;
