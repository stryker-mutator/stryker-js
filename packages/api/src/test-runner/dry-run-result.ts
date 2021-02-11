import { MutantCoverage } from '../core/mutant-coverage';

import { DryRunStatus } from './dry-run-status';
import { TestResult } from './test-result';

export type DryRunResult = CompleteDryRunResult | ErrorDryRunResult | TimeoutDryRunResult;

export interface CompleteDryRunResult {
  /**
   * The individual test results.
   */
  tests: TestResult[];

  mutantCoverage?: MutantCoverage;

  /**
   * The status of the run
   */
  status: DryRunStatus.Complete;
}
export interface TimeoutDryRunResult {
  /**
   * The status of the run
   */
  status: DryRunStatus.Timeout;
}

export interface ErrorDryRunResult {
  /**
   * The status of the run
   */
  status: DryRunStatus.Error;

  /**
   * If `state` is `error`, this collection should contain the error messages
   */
  errorMessage: string;
}
