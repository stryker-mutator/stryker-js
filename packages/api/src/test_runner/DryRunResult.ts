import { MutantCoverage } from '../core/MutantCoverage';
import { DryRunStatus } from './DryRunStatus';
import { TestResult } from './TestResult';

export type DryRunResult = CompleteDryRunResult | TimeoutDryRunResult | ErrorDryRunResult;

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
