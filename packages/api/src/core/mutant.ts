import * as schema from 'mutation-testing-report-schema';

import { Range } from './range';

export { MutantStatus } from 'mutation-testing-report-schema';

// We're reusing the `MutantResult` interface here to acquire uniformity.

/**
 * Represents a mutant in its initial state.
 */
export interface Mutant extends Pick<schema.MutantResult, 'id' | 'location' | 'mutatorName' | 'replacement'> {
  /**
   * The file name from which this mutant originated
   */
  fileName: string;
  /**
   * The range of this mutant (from/to within the file)
   * deprecate?
   */
  range: Range;
  /**
   * If the mutant was ignored during generation, the reason for ignoring it, otherwise `undefined`
   */
  ignoreReason?: string;
  /**
   * Actual mutation that has been applied.
   */
  replacement: string;
}

/**
 * Represents a mutant in its matched-with-the-tests state, ready to be tested.
 */
export type MutantTestCoverage = Mutant &
  Pick<schema.MutantResult, 'coveredBy' | 'static'> & {
    estimatedNetTime: number;
  };

/**
 * Represents a mutant in its final state, ready to be reported.
 */
export type MutantResult = Omit<Mutant, 'ignoreReason'> & schema.MutantResult;
