import TestResultMap from './test-runner/TestResultMap'
import StrykerOptions from './StrykerOptions';

interface TestRunner{
  new(options: StrykerOptions): TestRunner; 
  
  run(): TestResultMap;
}

export default TestRunner;