export enum MutantRunStatus {
  Killed = 'killed',
  Survived = 'survived',
  Timeout = 'timeout',
  Error = 'error',
}

export type MutantRunResult =
  | ErrorMutantRunResult
  | KilledMutantRunResult
  | SurvivedMutantRunResult
  | TimeoutMutantRunResult;

export interface TimeoutMutantRunResult {
  status: MutantRunStatus.Timeout;
  /**
   * An optional reason for the timeout
   */
  reason?: string;
  /**
   * The time it took before the timeout occurred in milliseconds.
   */
  duration?: number;
}

export interface KilledMutantRunResult {
  status: MutantRunStatus.Killed;
  /**
   * An array with the ids of the tests that killed this mutant
   */
  killedBy: string[];
  /**
   * The failure message that was reported by first the test
   */
  failureMessage: string;
  /**
   * The number of total tests ran in this test run.
   */
  nrOfTests: number;
  /**
   * The net time it took to run the tests for this mutant in milliseconds (without the overhead of the test runner).
   */
  duration?: number;
}

export interface SurvivedMutantRunResult {
  status: MutantRunStatus.Survived;
  /**
   * The number of total tests ran in this test run.
   */
  nrOfTests: number;
  /**
   * The net time it took to run the tests for this mutant in milliseconds (without the overhead of the test runner).
   */
  duration?: number;
}

export interface ErrorMutantRunResult {
  status: MutantRunStatus.Error;
  errorMessage: string;
}
