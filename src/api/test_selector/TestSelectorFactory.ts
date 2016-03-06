import {Factory} from '../core';
import TestSelectorSettings from './TestSelectorSettings';
import TestSelector from './TestSelector';

namespace TestSelectorFactory {

  class TestSelectorFactory extends Factory<TestSelectorSettings, TestSelector>{
    constructor() {
      super('test selector');
    }
  }
  let testSelectorFactoryInstance = new TestSelectorFactory();

  export function instance() {
    return <Factory<TestSelectorSettings, TestSelector>>testSelectorFactoryInstance;
  }
}

export default TestSelectorFactory;