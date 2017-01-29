import { MutantStatus, MatchedMutant, MutantResult } from 'stryker-api/report';
import { Location, Range, Position } from 'stryker-api/core';
export function mutantResult(status: MutantStatus): MutantResult {
  return {
    location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
    mutatedLines: '',
    mutatorName: '',
    originalLines: '',
    replacement: '',
    sourceFilePath: '',
    testsRan: [''],
    status: status,
    range: [0, 0]
  };
}

export function matchedMutant(numberOfTests: number): MatchedMutant {
  let scopedTestIds: number[] = [];
  for (let i = 0; i < numberOfTests; i++) {
    scopedTestIds.push(1);
  }
  return {
    mutatorName: '',
    scopedTestIds: scopedTestIds,
    timeSpentScopedTests: 0,
    filename: '',
    replacement: ''
  };
}
