import Mutator from './Mutator';
import { Factory } from 'stryker-api/core';

namespace MutatorFactory {
  /**
   * Represents a Factory for Mutators.
   */
  class MutatorFactory extends Factory<void, Mutator> {
    constructor() {
      super('mutator');
    }
  }
  let mutatorFactoryInstance = new MutatorFactory();

  /**
   * Returns the current instance of the MutatorFactory.
   */
  export function instance() {
    return <Factory<void, Mutator>>mutatorFactoryInstance;
  }
}

export default MutatorFactory;