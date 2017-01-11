import { MutantStatus, MatchedMutant, MutantResult } from 'stryker-api/report';

export function mutantResult(status: MutantStatus): MutantResult {
  return {
    location: null,
    mutatedLines: null,
    mutatorName: null,
    originalLines: null,
    replacement: null,
    sourceFilePath: null,
    testsRan: null,
    status,
    range: null
  };
}

export function matchedMutant(numberOfTests: number): MatchedMutant {
  let scopedTestIds: number[] = [];
  for (let i = 0; i < numberOfTests; i++) {
    scopedTestIds.push(1);
  }
  return {
    mutatorName: null,
    scopedTestIds: scopedTestIds,
    timeSpentScopedTests: null,
    filename: null,
    replacement: null
  };
}
