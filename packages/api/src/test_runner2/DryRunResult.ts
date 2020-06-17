import { MutantCoverage } from './MutantCoverage';
import { RunStatus } from './RunStatus';
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
