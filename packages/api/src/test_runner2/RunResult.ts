import { TestSelection } from '../../test_framework';

import { MutantCoverage } from './MutantCoverage';
import { RunStatus } from './RunStatus';
import { TestResult } from './TestResult';

export enum MutantRunStatus {
  Killed = 'killed',
  Survived = 'survived',
  TimedOut = 'timedOut',
  Error = 'error',
}

export type MutantRunResult = KilledMutantRunResult | SurvivedMutantRunResult;

export interface TimedOutMutantRunResult {
  status: MutantRunStatus.TimedOut;
}

export interface TimedOutMutantRunResult {
  status: MutantRunStatus.TimedOut;
}

export interface KilledMutantRunResult {
  status: MutantRunStatus.Killed;
  killedBy: TestSelection;
}

export interface SurvivedMutantRunResult {
  status: MutantRunStatus.Survived;
}

export interface ErrorMutantRunResult {
  status: MutantRunStatus.Error;
  errorMessage: string;
}

export type DryRunResult = CompleteDryRunResult | TimeoutDryRunResult | ErrorDryRunResult;

export interface CompleteDryRunResult {
  /**
   * The individual test results.
   */
  tests: TestResult[];

  mutationCoverage?: MutantCoverage;

  /**
   * The status of the run
   */
  status: RunStatus.Complete;
}
export interface TimeoutDryRunResult {
  /**
   * The status of the run
   */
  status: RunStatus.Timeout;
}

export interface ErrorDryRunResult {
  /**
   * The status of the run
   */
  status: RunStatus.Error;

  /**
   * If `state` is `error`, this collection should contain the error messages
   */
  errorMessage: string;
}
