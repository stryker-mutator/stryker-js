interface MatchedMutant {
  readonly fileName: string;
  readonly id: string;
  readonly mutatorName: string;
  readonly replacement: string;
  readonly scopedTestIds: number[];
  readonly timeSpentScopedTests: number;
}

export default MatchedMutant;
