import TestRunResult from './TestRunResult';
import StrykerOptions from './StrykerOptions';


abstract class TestRunner{
  constructor(protected options: StrykerOptions){
  }
  
  abstract run(): TestRunResult;
}

export default TestRunner;
