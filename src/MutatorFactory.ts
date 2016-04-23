import {Mutator} from './api/mutant';
import {Factory} from './api/core';
import {TestSelectorSettings} from './api/test_selector';

namespace MutatorFactory {
  /**
   * Represents a Factory for TestSelectors.
   */
  class MutatorFactory extends Factory<void, Mutator>{
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