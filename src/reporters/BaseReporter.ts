'use strict';

import Mutant from '../Mutant';

/**
 * Represents the base reporter as a blueprint for all reporters.
 * @constructor
 */
export default class BaseReporter {
  //TODO Change this class to an interface or abstract class (All other 'base' classes are abstract classes)
  
  /**
   * Reports on a single Mutant which has been tested.
   * @function
   * @param {Mutant} mutant - The tested Mutant.
   */
  mutantTested(mutant: Mutant) {}

  /**
   * Reports on all tested Mutants.
   * @function
   * @param {Mutant[]} mutants - The tested Mutants.
   */
  allMutantsTested(mutants: Mutant[]) {}
}

