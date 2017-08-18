import MutantGenerator from './MutantGenerator';
import { Factory } from '../../core';
import { Config } from '../../config';

namespace MutantGeneratorFactory {
  /**
   * Represents a Factory for TestFrameworks.
   */
  class MutantGeneratorFactory extends Factory<Config, MutantGenerator> {
    constructor() {
      super('mutant-generator');
    }
  }
  const mutatorFactoryInstance = new MutantGeneratorFactory();

  /**
   * Returns the current instance of the MutatorFactory.
   */
  export function instance() {
    return <Factory<Config, MutantGenerator>>mutatorFactoryInstance;
  }
}

export default MutantGeneratorFactory;