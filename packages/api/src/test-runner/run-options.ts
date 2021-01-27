import { Mutant, CoverageAnalysis } from '../core';

export interface RunOptions {
  /**
   * The amount of time (in milliseconds) the TestRunner has to complete the test run before a timeout occurs.
   */
  timeout: number;
}

export interface DryRunOptions extends RunOptions {
  /**
   * Indicates whether or not mutant coverage should be collected.
   */
  coverageAnalysis: CoverageAnalysis;
}

export interface MutantRunOptions extends RunOptions {
  testFilter?: string[];
  activeMutant: Mutant;
  sandboxFileName: string;
}
