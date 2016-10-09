import { Reporter, SourceFile, MutantResult } from 'stryker-api/report';
import { StrykerOptions } from 'stryker-api/core';

export default class MyReporter implements Reporter {

  constructor(options: StrykerOptions) {
  }

  /**
     * Called when a source file was loaded
     * @param file The immutable source file
     */
  onSourceFileRead(file: SourceFile): void {

  }

  /**
   * Called when all source files were loaded
   * @param files The immutable source files
   */
  onAllSourceFilesRead(files: SourceFile[]): void {

  }

  /**
   * Called when a mutant was tested
   * @param result The immutable result
   */
  onMutantTested(result: MutantResult): void {

  }

  /**
   * Called when all mutants were tested
   * @param results The immutable results
   */
  onAllMutantsTested(results: MutantResult[]): void {

  }

  /**
   * Called when stryker wants to quite
   * Gives a reporter the ability to finish up any async tasks
   * Stryker will not close untill the promise is either resolved or rejected.
   * @return a promise which will resolve when the reporter is done reporting
   */
  wrapUp(): void | Promise<void> {

  }
}