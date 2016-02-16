'use strict';

var TypeUtils = require('../utils/TypeUtils');

/**
 * Represents the base reporter as a blueprint for all reporters.
 * @constructor
 */
function BaseReporter() {
  this._typeUtils = new TypeUtils();
}

/**
 * Reports on a single Mutant which has been tested.
 * @function
 * @param {Mutant} mutant - The tested Mutant.
 */
BaseReporter.prototype.mutantTested = function(mutant) {
  this._typeUtils.expectParameterObject(mutant, 'BaseReporter', 'mutant');
};

/**
 * Reports on all tested Mutants.
 * @function
 * @param {Mutant[]} mutants - The tested Mutants.
 */
BaseReporter.prototype.allMutantsTested = function(mutants) {
  this._typeUtils.expectParameterArray(mutants, 'BaseReporter', 'mutants');
};

module.exports = BaseReporter;
