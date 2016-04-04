import {CoverageCollection} from './Coverage';
import TestResult from './TestResult';

/**
 * Represents the result of a testrun.
 */
interface RunResult {
  /**
   * The result of the test run.
   */
  result: TestResult;

  /**
   * The names of the tests which were ran.
   */
  specNames?: string[];

  /**
   * The amount of tests that succeeded.
   */
  succeeded?: number;

  /**
   * The amount of tests that failed.
   */
  failed?: number;

  /**
   * The time that the test run took (in milliseconds).
   */
  timeSpent?: number;

  /**
   * The code coverage which may have been collected during the test run.
   */
  coverage?: CoverageCollection;
  errorMessages?: string[];
}

export default RunResult;