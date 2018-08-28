import { SourceFile, MutantResult, MutantStatus, ScoreResult } from 'stryker-api/report';
import { MutationScoreThresholds } from 'stryker-api/core';

export const sourceFile = factory<SourceFile>(() => ({
  content: `
    function answer(){
      return 42;
    }`,
  path: 'src/test.js'
}));

export const thresholds = factory<MutationScoreThresholds>(() => ({
  break: null,
  high: 80,
  low: 60
}));

export const mutantResult = factory<MutantResult>(() => {
  const range: [number, number] = [24, 38];
  return {
    id: '1',
    location: {
      end: {
        column: 5,
        line: 4
      },
      start: {
        column: 22,
        line: 2
      }
    },
    mutatedLines: '{}',
    mutatorName: 'Math',
    originalLines: `{
      return 42;
    }`,
    range,
    replacement: '{}',
    sourceFilePath: 'src/test.js',
    status: MutantStatus.Killed,
    testsRan: ['should return 42']
  };
});

export const scoreResult = factory<ScoreResult>(() => ({
  childResults: [],
  killed: 1,
  mutationScore: 10.6666666667,
  mutationScoreBasedOnCoveredCode: 11.23232323223,
  name: 'src',
  noCoverage: 4,
  path: 'src',
  representsFile: false,
  runtimeErrors: 5,
  survived: 3,
  timedOut: 2,
  totalCovered: 12,
  totalDetected: 7,
  totalInvalid: 10,
  totalMutants: 11,
  totalUndetected: 8,
  totalValid: 9,
  transpileErrors: 6
}));

function factory<T>(defaults: () => T) {
  return (overrides?: Partial<T>): T => Object.assign({}, defaults(), overrides);
}
