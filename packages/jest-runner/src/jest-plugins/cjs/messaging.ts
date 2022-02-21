import type { CoverageAnalysis, MutantCoverage } from '@stryker-mutator/api/core';

type MutantCoverageHandler = (fileName: string, coverage: MutantCoverage | undefined) => void;

class State {
  constructor() {
    this.resetMutantCoverageHandler();
  }

  public coverageAnalysis: CoverageAnalysis = 'off';
  public jestEnvironment = 'jest-runner/circus';
  private mutantCoverageHandler?: MutantCoverageHandler;
  public hitCount: number | undefined;
  public hitLimit: number | undefined;

  /**
   * Keeps track of whether or not the current call to "setup" is for the first test file or not.
   */
  public firstTestFile = true;

  public setMutantCoverageHandler(handler: MutantCoverageHandler) {
    this.mutantCoverageHandler = handler;
  }

  public handleMutantCoverage(fileName: string, coverage: MutantCoverage | undefined) {
    this.mutantCoverageHandler!(fileName, coverage);
  }

  public resetMutantCoverageHandler() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.mutantCoverageHandler = () => {};
  }
}

export const state = new State();
