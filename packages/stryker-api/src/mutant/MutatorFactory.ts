import Mutator from './Mutator';
import { Factory } from '../../core';
import { Config } from '../../config';

namespace MutatorFactory {
  /**
   * Represents a Factory for Mutators.
   */
  class MutatorFactory extends Factory<Config, Mutator> {
    constructor() {
      super('mutant-generator');
    }
  }
  const mutatorFactoryInstance = new MutatorFactory();

  /**
   * Returns the current instance of the MutatorFactory.
   */
  export function instance() {
    return mutatorFactoryInstance as Factory<Config, Mutator>;
  }
}

export default MutatorFactory;
