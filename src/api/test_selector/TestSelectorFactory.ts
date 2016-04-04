import {Factory} from '../core';
import TestSelectorSettings from './TestSelectorSettings';
import TestSelector from './TestSelector';

namespace TestSelectorFactory {
  /**
   * Represents a Factory for TestSelectors.
   */
  class TestSelectorFactory extends Factory<TestSelectorSettings, TestSelector>{
    constructor() {
      super('test selector');
    }
  }
  let testSelectorFactoryInstance = new TestSelectorFactory();

  /**
   * Returns the current instance of the TestSelectorFactory.
   */
  export function instance() {
    return <Factory<TestSelectorSettings, TestSelector>>testSelectorFactoryInstance;
  }
}

export default TestSelectorFactory;