import { Location } from '../../core';

/**
 * Represents a collection of code coverage results per test run.
 */
export interface CoveragePerTestResult {
  /**
   * The baseline coverage which is true for each test run.
   * This baseline should be taken when all files all loaded, but before tests are ran.
   */
  baseline: CoverageCollection;
  /**
   * The deviations with respect to the baseline per test.
   */
  deviations: CoverageCollectionPerTest;
}

/**
 * Represents a collection of code coverage results per test run.
 */
export interface CoverageCollectionPerTest {
  [testId: number]: CoverageCollection;
}

/**
 * Represents a collection of Coverage results for a set of files.
 */
export interface CoverageCollection {
  /**
   * An array of CoverageResults for files.
   */
  [filename: string]: CoverageResult;
}

/**
 * Represents the coverage result for a single file.
 */
export interface CoverageResult {
  /**
   * Hash of statement counts, where keys are statement IDs.
   */
  s: CoverageData;
  /**
   * Hash of function counts, where keys are statement IDs.
   */
  f: CoverageData;
}

/**
 * Indicates the amount of time a certain type of data was covered.
 * The key depends on the context. This can for example be a line number, making the value the amount of times the line was covered.
 */
export interface CoverageData {
  [ref: string]: number;
}

/**
 * Hash where keys are statement IDs, and values are Location objects for each statement.
 * The Location for a function definition is really an assignment, and should include the entire function.
 */
export interface StatementMap {
  [ref: string]: Location;
}
