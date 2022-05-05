import type { CoverageAnalysis, InstrumenterContext } from '@stryker-mutator/api/core';

class State {
  public instrumenterContext!: InstrumenterContext;
  public testFilesWithStrykerEnvironment = new Set<string>();
  public coverageAnalysis!: CoverageAnalysis;
  public jestEnvironment!: string;

  constructor() {
    this.clear();
  }

  public clear() {
    this.testFilesWithStrykerEnvironment.clear();
    this.instrumenterContext = {};
    this.coverageAnalysis = 'off';
    this.jestEnvironment = 'jest-environment-node';
  }
}

export const state = new State();
