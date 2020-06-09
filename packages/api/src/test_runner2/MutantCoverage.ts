export type MutantCoverage = StaticCoverage & CoveragePerTestId;

export interface StaticCoverage {
  static: CoverageData;
}

export interface CoveragePerTestId {
  [testId: number]: CoverageData;
}

export interface CoverageData {
  [mutantId: number]: number;
}
