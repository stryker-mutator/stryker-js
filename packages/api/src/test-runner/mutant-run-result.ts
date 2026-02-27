import { TestStatus } from './test-status.js';

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
   * Optional per-test timing details for tests executed in this mutant run.
   */
  executedTests?: MutantRunExecutedTest[];
}

export interface SurvivedMutantRunResult {
  status: MutantRunStatus.Survived;
  /**
   * The number of total tests ran in this test run.
   */
  nrOfTests: number;

  /**
   * Optional per-test timing details for tests executed in this mutant run.
   */
  executedTests?: MutantRunExecutedTest[];
}

export interface ErrorMutantRunResult {
  status: MutantRunStatus.Error;
  errorMessage: string;
}

export interface MutantRunExecutedTest {
  id: string;
  name: string;
  status: TestStatus;
  timeSpentMs: number;
  fileName?: string;
}
