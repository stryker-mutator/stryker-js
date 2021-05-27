export interface MutantCoverage {
  static: CoverageData;
  perTest: CoveragePerTestId;
}

export type CoveragePerTestId = Record<string, CoverageData>;

/**
 * Keys are mutant ids, the numbers are the amount of times it was hit.
 */
export type CoverageData = Record<string, number>;
