import { Config } from '../../config';
import { Factory } from '../../core';
import Mutator from './Mutator';

namespace MutatorFactory {
  /**
   * Represents a Factory for Mutators.
   */
  class MutatorFactory extends Factory<Config, Mutator> {
    constructor() {
      super('mutant-generator');
    }

    /**
     * Returns the import suggestion for a Mutator
     * @param name The name of the Mutator the user tried to use.
     * @returns The name of the package the user may want to install (if it exists).
     */
    public importSuggestion(name: string) {
      if (name === 'typescript') {
        return `stryker-${name}`;
      }

      return `stryker-${name}-mutator`;
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
