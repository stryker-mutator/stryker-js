import {StrykerOptions} from '../core';
import SourceFile from './SourceFile';
import MutantResult from './MutantResult';
import Reporter from './Reporter';

export default class BaseReporter implements Reporter {

  onConfigReadingComplete(options: StrykerOptions): void {

  }

  onSourceFileRead(file: SourceFile): void {
  }

  onSourceFileReadingComplete(files: SourceFile[]): void {
  }

  onMutantTested(result: MutantResult): void {
  }

  onMutationTestingComplete(results: MutantResult[], files: SourceFile[]): void {
  }
}
