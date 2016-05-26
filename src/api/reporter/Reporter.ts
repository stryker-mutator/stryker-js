import SourceFile from './SourceFile';
import MutantResult from './MutantResult';
import {StrykerOptions} from '../core';

interface Reporter {

  onConfigRead?(config: StrykerOptions): void;

  onSourceFileRead?(file: SourceFile): void;

  onAllSourceFilesRead?(files: SourceFile[]): void;

  onMutantTested?(result: MutantResult): void;

  onAllMutantsTested?(results: MutantResult[]): void;
}

export default Reporter;