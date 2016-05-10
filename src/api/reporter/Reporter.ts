import SourceFile from './SourceFile';
import MutantResult from './MutantResult';
import {StrykerOptions} from '../core';

interface Reporter {

  onConfigReadingComplete(config: StrykerOptions): void;

  onSourceFileRead(file: SourceFile): void;

  onSourceFileReadingComplete(files: SourceFile[]): void;

  onMutantTested(result: MutantResult): void;

  onMutationTestingComplete(results: MutantResult[], files: SourceFile[]): void;
}

export default Reporter;