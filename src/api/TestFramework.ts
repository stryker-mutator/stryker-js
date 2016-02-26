import StrykerOptions from './StrykerOptions';

abstract class TestFramework{
  constructor(protected options: StrykerOptions){
  }
  
  abstract prepareTestFiles(testFilePaths: string[]): string[];
  
  abstract chooseTest(id: number): void;
}