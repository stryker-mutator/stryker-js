export enum MutantRunStatus {
  Killed = 'killed',
  Survived = 'survived',
  Timeout = 'timeout',
  Error = 'error',
}

export type MutantRunResult = ErrorMutantRunResult | KilledMutantRunResult | SurvivedMutantRunResult | TimeoutMutantRunResult;

export interface TimeoutMutantRunResult {
  status: MutantRunStatus.Timeout;
}

export interface KilledMutantRunResult {
  status: MutantRunStatus.Killed;
  /**
   * The id of the test that killed this mutant
   */
  killedBy: string;
  /**
   * The failure message that was reported by the test
   */
  failureMessage: string;
  /**
   * The number of total tests ran in this test run.
   */
  nrOfTests: number;
}

export interface SurvivedMutantRunResult {
  status: MutantRunStatus.Survived;
  /**
   * The number of total tests ran in this test run.
   */
  nrOfTests: number;
}

export interface ErrorMutantRunResult {
  status: MutantRunStatus.Error;
  errorMessage: string;
}
