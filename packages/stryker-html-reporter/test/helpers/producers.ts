import { SourceFile, MutantResult, MutantStatus, ScoreResult } from 'stryker-api/report';
import { MutationScoreThresholds } from 'stryker-api/core';

export const sourceFile = factory<SourceFile>(() => ({
  path: 'src/test.js',
  content: `
    function answer(){
      return 42;
    }`
}));

export const thresholds = factory<MutationScoreThresholds>(() => ({
  break: null,
  high: 80,
  low: 60
}));

export const mutantResult = factory<MutantResult>(() => {
  const range: [number, number] = [24, 38];
  return {
    sourceFilePath: 'src/test.js',
    mutatorName: 'Math',
    status: MutantStatus.Killed,
    replacement: '{}',
    originalLines: `{
      return 42;
    }`,
    mutatedLines: '{}',
    testsRan: ['should return 42'],
    location: {
      start: {
        line: 2,
        column: 22
      },
      end: {
        line: 4,
        column: 5
      }
    },
    range
  };
});

export const scoreResult = factory<ScoreResult>(() => ({
  name: 'src',
  path: 'src',
  representsFile: false,
  childResults: [],
  killed: 1,
  timedOut: 2,
  survived: 3,
  noCoverage: 4,
  runtimeErrors: 5,
  transpileErrors: 6,
  totalDetected: 7,
  totalUndetected: 8,
  totalValid: 9,
  totalInvalid: 10,
  totalMutants: 11,
  totalCovered: 12,
  mutationScore: 10.6666666667,
  mutationScoreBasedOnCoveredCode: 11.23232323223
}));

function factory<T>(defaults: () => T) {
  return (overrides?: Partial<T>): T => Object.assign({}, defaults(), overrides);
}
