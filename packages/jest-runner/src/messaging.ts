import { CoverageAnalysis, MutantCoverage } from '@stryker-mutator/api/core';

export interface SingleFileMutantCoverage extends MutantCoverage {
  fileName: string;
}

type MutantCoverageHandler = (coverage: SingleFileMutantCoverage) => void;

class State {
  constructor() {
    this.resetMutantCoverageHandler();
  }

  public testFilter: string[] | undefined = undefined;
  public coverageAnalysis: CoverageAnalysis = 'off';
  private mutantCoverageHandler: MutantCoverageHandler;

  public setMutantCoverageHandler(handler: MutantCoverageHandler) {
    this.mutantCoverageHandler = handler;
  }

  public handleMutantCoverage(coverage: SingleFileMutantCoverage | undefined) {
    if (coverage) {
      this.mutantCoverageHandler(coverage);
    }
  }

  public resetMutantCoverageHandler() {
    this.mutantCoverageHandler = () => {};
  }
}

export const state = new State();
