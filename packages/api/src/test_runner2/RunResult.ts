import { TestSelection } from '../../test_framework';

import { MutantCoverage } from './MutantCoverage';
import { RunStatus } from './RunStatus';
import { TestResult } from './TestResult';

export enum MutantRunStatus {
  Killed = 'killed',
  Survived = 'survived',
}

export type MutantRunResult = KilledMutantRunResult | SurvivedMutantRunResult;

export interface KilledMutantRunResult extends RunResult {
  status: MutantRunStatus.Killed;
  culpritTest: TestSelection;
}

export interface SurvivedMutantRunResult extends RunResult {
  status: MutantRunStatus.Survived;
  testSelection: TestSelection[] | false;
}

/**
 * Represents the result of a test run.
 */
export interface RunResult {
  /**
   * If `state` is `error`, this collection should contain the error messages
   */
  errorMessage?: string;
}

export interface DryRunResult extends RunResult {
  /**
   * The individual test results.
   */
  tests: TestResult[];

  mutationCoverage?: MutantCoverage;

  /**
   * The status of the run
   */
  status: RunStatus;
}
