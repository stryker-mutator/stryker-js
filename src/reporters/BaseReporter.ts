'use strict';

import TypeUtils from '../utils/TypeUtils';

/**
 * Represents the base reporter as a blueprint for all reporters.
 * @constructor
 */
export default class BaseReporter {
  
  _typeUtils = new TypeUtils();  
  
  /**
   * Reports on a single Mutant which has been tested.
   * @function
   * @param {Mutant} mutant - The tested Mutant.
   */
  mutantTested(mutant) {
    this._typeUtils.expectParameterObject(mutant, 'BaseReporter', 'mutant');
  };

  /**
   * Reports on all tested Mutants.
   * @function
   * @param {Mutant[]} mutants - The tested Mutants.
   */
  allMutantsTested(mutants) {
    this._typeUtils.expectParameterArray(mutants, 'BaseReporter', 'mutants');
  };
}

