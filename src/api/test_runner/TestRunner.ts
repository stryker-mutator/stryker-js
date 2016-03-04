import TestRunResult from './RunResult';
import {StrykerOptions} from './../core';
import RunnerOptions from './RunnerOptions';
import RunOptions from './RunOptions';


abstract class TestRunner{
  constructor(protected options: RunnerOptions){
  }
  
  abstract run(options: RunOptions): Promise<TestRunResult>;
}

export default TestRunner;
