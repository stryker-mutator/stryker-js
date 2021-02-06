import { CoverageAnalysis, MutantCoverage } from '@stryker-mutator/api/core';

type MutantCoverageHandler = (fileName: string, coverage: MutantCoverage | undefined) => void;

class State {
  constructor() {
    this.resetMutantCoverageHandler();
  }

  public coverageAnalysis: CoverageAnalysis = 'off';
  private mutantCoverageHandler?: MutantCoverageHandler;

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
