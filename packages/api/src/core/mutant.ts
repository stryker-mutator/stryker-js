import * as schema from 'mutation-testing-report-schema/api';

export type { MutantStatus } from 'mutation-testing-report-schema/api';

// We're reusing the `MutantResult` interface here to acquire uniformity.

/**
 * Represents a mutant in its initial state.
 */
export interface Mutant
  extends Pick<
    schema.MutantResult,
    | 'coveredBy'
    | 'id'
    | 'killedBy'
    | 'location'
    | 'mutatorName'
    | 'replacement'
    | 'static'
    | 'statusReason'
    | 'testsCompleted'
  > {
  /**
   * The file name from which this mutant originated
   */
  fileName: string;
  /**
   * Actual mutation that has been applied.
   */
  replacement: string;
  /**
   * The status of a mutant if known. This should be undefined for a mutant that still needs testing.
   */
  status?: schema.MutantStatus;
}

/**
 * Represents a mutant in its matched-with-the-tests state, ready to be tested.
 */
export type MutantTestCoverage = Mutant &
  Pick<schema.MutantResult, 'coveredBy' | 'static'>;

/**
 * Represents a mutant in its final state, ready to be reported.
 */
export type MutantResult = Mutant & schema.MutantResult;
