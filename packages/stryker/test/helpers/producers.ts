import { TestResult, TestStatus, RunResult, RunStatus } from 'stryker-api/test_runner';
import { Mutant } from 'stryker-api/mutant';
import { FileLocation, TranspileResult } from 'stryker-api/transpile';
import { Config } from 'stryker-api/config';
import * as sinon from 'sinon';
import { TestFramework } from 'stryker-api/test_framework';
import { MutantStatus, MatchedMutant, MutantResult, Reporter, ScoreResult } from 'stryker-api/report';
import { MutationScoreThresholds, File, Location, TextFile, BinaryFile } from 'stryker-api/core';
import StrictReporter from '../../src/reporters/StrictReporter';

export type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};

export function mock<T>(constructorFn: { new(...args: any[]): T; }): Mock<T> {
  return sinon.createStubInstance(constructorFn) as Mock<T>;
}

function factory<T>(defaults: T) {
  return (overrides?: Partial<T>) => Object.assign({}, defaults, overrides);
}

export const location = factory<Location>({ start: { line: 0, column: 0 }, end: { line: 0, column: 0 } });

export const mutantResult = factory<MutantResult>({
  location: location(),
  mutatedLines: '',
  mutatorName: '',
  originalLines: '',
  replacement: '',
  sourceFilePath: '',
  testsRan: [''],
  status: MutantStatus.Killed,
  range: [0, 0]
});

export const mutant = factory<Mutant>({
  mutatorName: 'foobarMutator',
  fileName: 'file',
  range: [0, 0],
  replacement: 'replacement'
});

export const textFile = factory<TextFile>({
  name: 'file.js',
  content: '',
  mutated: true,
  included: true
});

export const fileLocation = factory<FileLocation>({
  fileName: 'fileName',
  start: { line: 0, column: 0 }, end: { line: 0, column: 0 }
});


export const testFramework = factory<TestFramework>({
  beforeEach(codeFragment: string) { return `beforeEach(){ ${codeFragment}}`; },
  afterEach(codeFragment: string) { return `afterEach(){ ${codeFragment}}`; },
  filter(ids: number[]) { return `filter: ${ids}`; }
});

export const scoreResult = factory<ScoreResult>({
  name: 'name',
  path: 'path',
  childResults: [],
  representsFile: true,
  killed: 0,
  timedOut: 0,
  survived: 0,
  totalCovered: 0,
  totalMutants: 0,
  totalDetected: 0,
  totalUndetected: 0,
  errors: 0,
  noCoverage: 0,
  mutationScore: 0,
  mutationScoreBasedOnCoveredCode: 0
});

export const testResult = factory<TestResult>({
  name: 'name',
  status: TestStatus.Success,
  timeSpentMs: 10
});

export const runResult = factory<RunResult>({
  tests: [testResult()],
  status: RunStatus.Complete
});

export const file = factory<File>({
  name: 'file.js',
  content: '',
  mutated: true,
  included: true
});

export const binaryFile = factory<BinaryFile>({
  name: 'file.js',
  content: Buffer.from(''),
  mutated: true,
  included: true
});


export const mutationScoreThresholds = factory<MutationScoreThresholds>({
  high: 80,
  low: 60,
  break: null
});

export const config = factory<Config>(new Config());

export const ALL_REPORTER_EVENTS: Array<keyof Reporter> =
  ['onSourceFileRead', 'onAllSourceFilesRead', 'onAllMutantsMatchedWithTests', 'onMutantTested', 'onAllMutantsTested', 'onScoreCalculated', 'wrapUp'];

export const reporterStub = factory<StrictReporter>({
  onAllMutantsMatchedWithTests: sinon.stub(),
  onSourceFileRead: sinon.stub(),
  onAllMutantsTested: sinon.stub(),
  onAllSourceFilesRead: sinon.stub(),
  onMutantTested: sinon.stub(),
  onScoreCalculated: sinon.stub(),
  wrapUp: sinon.stub()
});

export function matchedMutant(numberOfTests: number): MatchedMutant {
  let scopedTestIds: number[] = [];
  for (let i = 0; i < numberOfTests; i++) {
    scopedTestIds.push(1);
  }
  return {
    mutatorName: '',
    scopedTestIds: scopedTestIds,
    timeSpentScopedTests: 0,
    fileName: '',
    replacement: ''
  };
}

export const transpileResult = factory<TranspileResult>({
  error: null,
  outputFiles: [file(), file()]
});