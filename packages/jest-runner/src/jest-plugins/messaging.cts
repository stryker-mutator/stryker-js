import type {
  CoverageAnalysis,
  InstrumenterContext,
  // @ts-expect-error Can't import the types somehow, because the file is a common js file
} from '@stryker-mutator/api/core';

class State {
  public instrumenterContext!: InstrumenterContext;
  public testFilesWithStrykerEnvironment = new Set<string>();
  public coverageAnalysis!: CoverageAnalysis;
  public jestEnvironment!: string;
  public resolveFromDirectory!: string;

  constructor() {
    this.clear();
  }

  public clear() {
    this.testFilesWithStrykerEnvironment.clear();
    this.instrumenterContext = {};
    this.coverageAnalysis = 'off';
    this.jestEnvironment = 'jest-environment-node';
    this.resolveFromDirectory = process.cwd();
  }
}

export const state = new State();
