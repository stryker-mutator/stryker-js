import { Factory } from '../../core';
import TestFrameworkSettings from './TestFrameworkSettings';
import TestFramework from './TestFramework';

namespace TestFrameworkFactory {
  /**
   * Represents a Factory for TestFrameworks.
   */
  class TestFrameworkFactory extends Factory<TestFrameworkSettings, TestFramework> {
    constructor() {
      super('test framework');
    }
  }
  const TestFrameworkFactoryInstance = new TestFrameworkFactory();

  /**
   * Returns the current instance of the TestFrameworkFactory.
   */
  export function instance() {
    return TestFrameworkFactoryInstance as Factory<TestFrameworkSettings, TestFramework>;
  }
}

export default TestFrameworkFactory;
