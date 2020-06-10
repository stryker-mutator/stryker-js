import { MutantCoverage } from './MutantCoverage';
import { RunStatus } from './RunStatus';
import { TestResult } from './TestResult';

/**
 * Marker interface for a mutant run result.
 */
export interface MutantRunResult extends RunResult {}

/**
 * Represents the result of a test run.
 */
export interface RunResult {
  /**
   * The individual test results.
   */
  tests: TestResult[];

  /**
   * If `state` is `error`, this collection should contain the error messages
   */
  errorMessage?: string;

  /**
   * The status of the run
   */
  status: RunStatus;
}

export interface DryRunResult extends RunResult {
  mutationCoverage?: MutantCoverage;
}
