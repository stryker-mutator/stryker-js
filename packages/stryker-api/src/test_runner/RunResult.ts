import { CoverageCollection, CoveragePerTestResult } from './Coverage';
import RunStatus from './RunStatus';
import TestResult from './TestResult';

/**
 * Represents the result of a test run.
 */
interface RunResult {

  /**
   * Optional: the code coverage result of the run.
   */
  coverage?: CoverageCollection | CoveragePerTestResult;

  /**
   * If `state` is `error`, this collection should contain the error messages
   */
  errorMessages?: string[];

  /**
   * The status of the run
   */
  status: RunStatus;
  /**
   * The individual test results.
   */
  tests: TestResult[];
}

export default RunResult;
