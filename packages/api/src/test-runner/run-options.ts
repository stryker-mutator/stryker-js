import { Mutant, CoverageAnalysis } from '../core/index.js';

export interface RunOptions {
  /**
   * The amount of time (in milliseconds) the TestRunner has to complete the test run before a timeout occurs.
   */
  timeout: number;
  /**
   * Filled from disableBail in config
   */
  disableBail: boolean;
}

export interface DryRunOptions extends RunOptions {
  /**
   * Indicates whether or not mutant coverage should be collected.
   */
  coverageAnalysis: CoverageAnalysis;
  /**
   * Files with mutants to run tests for.
   */
  files?: string[];
}

export type MutantActivation = 'runtime' | 'static';

export interface MutantRunOptions extends RunOptions {
  testFilter?: string[];
  hitLimit?: number;
  activeMutant: Mutant;
  /**
   * The name of file inside the sandbox in which the mutant resides
   */
  sandboxFileName: string;
  /**
   * Determine when to active the mutant.
   * - 'runtime'. The test environment should first load all tests and sut files before activating the mutant. Mutant is only active during runtime.
   * - 'static'. The test environment should load _while the mutant is active_. Mutant may be active during the entire lifetime of the process.
   * See https://github.com/stryker-mutator/stryker-js/issues/3442 for more details
   */
  mutantActivation: MutantActivation;
  /**
   * Determines whether or not the test environment should be reloaded.
   * This is necessary when testing static mutants, where the mutant is only executed when the test environment is loaded.
   * A test runner might be unable to reload the test environment, i.e. when the files were loaded via `import` in nodejs.
   * In which case the test runner should report `reloadEnvironment: false` in it's capabilities.
   */
  reloadEnvironment: boolean;
}
