import { Factory } from 'stryker-api/core';
import NodeMutator from './mutators/NodeMutator';

namespace NodeMutatorFactory {
  /**
   * Represents a Factory for TestFrameworks.
   */
  class NodeMutatorFactory extends Factory<void, NodeMutator> {
    constructor() {
      super('nodeMutator');
    }
  }
  const nodeMutatorFactoryInstance = new NodeMutatorFactory();

  /**
   * Returns the current instance of the MutatorFactory.
   */
  export function instance() {
    return nodeMutatorFactoryInstance as Factory<void, NodeMutator>;
  }
}

export default NodeMutatorFactory;
