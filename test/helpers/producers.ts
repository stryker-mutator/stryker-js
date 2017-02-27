import { MutantStatus, MatchedMutant, MutantResult, Reporter } from 'stryker-api/report';

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

export const ALL_REPORTER_EVENTS: Array<keyof Reporter> =
  ['onSourceFileRead', 'onAllSourceFilesRead', 'onAllMutantsMatchedWithTests', 'onMutantTested', 'onAllMutantsTested', 'wrapUp'];

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
