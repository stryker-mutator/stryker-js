import {Factory} from '../core';
import TestRunner from './TestRunner';

namespace TestRunnerFactory{
  
  class TestRunnerFactory extends Factory<TestRunner> {
    constructor(){
      super('testrunner');
    }
  }
  
  let testRunnerInstance = new TestRunnerFactory();
  
  export function instance(){
    return <Factory<TestRunner>>testRunnerInstance;
  }
}

export default TestRunnerFactory;