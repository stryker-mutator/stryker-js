import {Factory} from '../core';
import TestRunner from './TestRunner';
import RunnerOptions from './RunnerOptions';

namespace TestRunnerFactory {

  class TestRunnerFactory extends Factory<RunnerOptions, TestRunner> {
    constructor() {
      super('testrunner');
    }
    
    importSuggestion(name: string){
      return `stryker-${name}-runner`;
    }
  }

  let testRunnerFactoryInstance = new TestRunnerFactory();

  export function instance() {
    return <Factory<RunnerOptions, TestRunner>>testRunnerFactoryInstance;
  }
}

export default TestRunnerFactory;