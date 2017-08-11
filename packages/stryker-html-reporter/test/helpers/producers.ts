import { SourceFile, MutantResult, MutantStatus, ScoreResult } from 'stryker-api/report';


export function sourceFile(overrides: Partial<SourceFile>): SourceFile {
  const defaults: SourceFile = {
    path: 'src/test.js',
    content: `
    function answer(){
      return 42;
    }
    `
  };
  return produce(overrides, defaults);
}

export function mutantResult(overrides: Partial<MutantResult> = {}): MutantResult {
  const range: [number, number] = [24, 38];
  return produce(overrides, {
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
  });
}

export function scoreResult(overrides: Partial<ScoreResult> = {}): ScoreResult {
  return produce(overrides, {
    name: 'src',
    path: 'src',
    representsFile: false,
    childResults: [],
    killed: 1,
    timedOut: 2,
    survived: 3,
    noCoverage: 4, 
    errors: 5,
    totalDetected: 6,
    totalUndetected: 7,
    totalMutants: 8, 
    totalCovered: 9,
    mutationScore: 10.6666666667,
    mutationScoreBasedOnCoveredCode: 11.23232323223
  });
}

function produce<T>(overrides: Partial<T>, defaults: T): T {
  return Object.assign({}, defaults, overrides);
}