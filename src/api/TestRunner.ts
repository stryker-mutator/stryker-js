import TestRunResult from './TestRunResult';
import StrykerOptions from './StrykerOptions';
import TestRunnerOptions from './TestRunnerOptions';


abstract class TestRunner{
  constructor(protected sourceFiles: string[], protected files: string[], protected runnerOptions: TestRunnerOptions, protected strykerOptions: StrykerOptions){
  }
  
  abstract run(): Promise<TestRunResult>;
}

export default TestRunner;
