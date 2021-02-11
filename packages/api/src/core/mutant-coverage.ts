export interface MutantCoverage {
  static: CoverageData;
  perTest: CoveragePerTestId;
}

export type CoveragePerTestId = Record<string, CoverageData>;

export type CoverageData = Record<number, number>;
