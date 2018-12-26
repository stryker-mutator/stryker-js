import { Factory } from '../../core';
import RunnerOptions from './RunnerOptions';
import TestRunner from './TestRunner';

namespace TestRunnerFactory {

  /**
   * Represents a Factory for TestRunners.
   */
  class TestRunnerFactory extends Factory<RunnerOptions, TestRunner> {
    constructor() {
      super('testrunner');
    }

    /**
     * Returns the import suggestion for a TestRunner
     * @param name The name of the TestRunner the user tried to use.
     * @returns The name of the package the user may want to install (if it exists).
     */
    public importSuggestion(name: string) {
      return `stryker-${name}-runner`;
    }
  }

  const testRunnerFactoryInstance = new TestRunnerFactory();

  /**
   * Returns the current instance of the TestRunnerFactory.
   */
  export function instance() {
    return testRunnerFactoryInstance as Factory<RunnerOptions, TestRunner>;
  }
}

export default TestRunnerFactory;
