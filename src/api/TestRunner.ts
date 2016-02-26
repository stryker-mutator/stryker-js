import TestResultMap from './test-runner/TestResultMap'

interface TestRunner{
  run(): TestResultMap;
}

export default TestRunner;