import ScoreResult from './ScoreResult';
import SourceFile from './SourceFile';
import MutantResult from './MutantResult';
import MatchedMutant from './MatchedMutant';

/**
 * Represents a reporter which can report during or after a Stryker run
 */
interface Reporter {

  /**
   * Called when a source file was loaded
   * @param file The immutable source file 
   */
  onSourceFileRead?(file: SourceFile): void;

  /**
   * Called when all source files were loaded
   * @param files The immutable source files 
   */
  onAllSourceFilesRead?(files: SourceFile[]): void;

  /**
   * Called when mutants are matched with tests
   * @param results The immutable array of mutants
   */
  onAllMutantsMatchedWithTests?(results: ReadonlyArray<MatchedMutant>): void;

  /**
   * Called when a mutant was tested
   * @param result The immutable result
   */
  onMutantTested?(result: MutantResult): void;

  /**
   * Called when all mutants were tested
   * @param results The immutable results
   */
  onAllMutantsTested?(results: MutantResult[]): void;

  /**
   * Called when the mutation score is calculated.
   * @param score The immutable structured score result (tree)
   */
  onScoreCalculated?(score: ScoreResult): void;

  /**
   * Called when stryker wants to quit
   * Gives a reporter the ability to finish up any async tasks
   * Stryker will not close until the promise is either resolved or rejected.
   * @return a promise which will resolve when the reporter is done reporting
   */
  wrapUp?(): void | Promise<void>;
}

export default Reporter;