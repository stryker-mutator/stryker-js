export interface MutantCoverage {
  static: CoverageData;
  perTest: CoveragePerTestId;
}

export interface CoveragePerTestId {
  [testId: string]: CoverageData;
}

export interface CoverageData {
  [mutantId: number]: number;
}
