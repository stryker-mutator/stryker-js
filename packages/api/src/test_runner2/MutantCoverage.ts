export interface MutantCoverage {
  static: CoverageData;
  perTest: CoveragePerTestId;
}

export interface CoveragePerTestId {
  [testId: number]: CoverageData;
}

export interface CoverageData {
  [mutantId: number]: number;
}
