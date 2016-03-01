import {StrykerOptions} from './core';

abstract class TestFramework{
  constructor(protected options: StrykerOptions){
  }
  
  abstract prepareTestFiles(testFilePaths: string[]): string[];
  
  abstract chooseTest(id: number): void;
}

export default TestFramework;