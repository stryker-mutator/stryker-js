import TestRunResult from './RunResult';
import {StrykerOptions} from './../core';
import RunnerOptions from './RunnerOptions';
import RunOptions from './RunOptions';


abstract class TestRunner{
  constructor(protected sourceFiles: string[], protected files: string[], protected runnerOptions: RunnerOptions, protected strykerOptions: StrykerOptions){
  }
  
  abstract run(options: RunOptions): Promise<TestRunResult>;
}

export default TestRunner;
