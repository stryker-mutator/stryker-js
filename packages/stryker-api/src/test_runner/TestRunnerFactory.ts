import {Factory} from '../../core';
import TestRunner from './TestRunner';
import RunnerOptions from './RunnerOptions';

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
    importSuggestion(name: string) {
      return `stryker-${name}-runner`;
    }
  }

  let testRunnerFactoryInstance = new TestRunnerFactory();

  /**
   * Returns the current instance of the TestRunnerFactory.
   */
  export function instance() {
    return <Factory<RunnerOptions, TestRunner>>testRunnerFactoryInstance;
  }
}

export default TestRunnerFactory;