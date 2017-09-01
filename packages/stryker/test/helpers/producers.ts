import { TestResult, TestStatus, RunResult, RunStatus } from 'stryker-api/test_runner';
import { Mutant } from 'stryker-api/mutant';
import { FileLocation, TranspileResult } from 'stryker-api/transpile';
import { Config } from 'stryker-api/config';
import * as sinon from 'sinon';
import { TestFramework } from 'stryker-api/test_framework';
import { MutantStatus, MatchedMutant, MutantResult, Reporter, ScoreResult } from 'stryker-api/report';
import { MutationScoreThresholds, File, Location, TextFile, BinaryFile, FileKind, WebFile, FileDescriptor } from 'stryker-api/core';
import TestableMutant from '../../src/TestableMutant';
import SourceFile from '../../src/SourceFile';
import TranspiledMutant from '../../src/TranspiledMutant';
import { Logger } from 'log4js';

export type Mock<T> = {
  [P in keyof T]: sinon.SinonStub;
};

export function mock<T>(constructorFn: { new(...args: any[]): T; }): Mock<T> {
  return sinon.createStubInstance(constructorFn) as Mock<T>;
}

/**
 * Use this factory to create flat test data
 * @param defaults 
 */
function factory<T>(defaults: T) {
  return (overrides?: Partial<T>) => Object.assign({}, defaults, overrides);
}

/**
 * Use this factory method to create deep test data
 * @param defaults 
 */
function factoryMethod<T>(defaultsFactory: () => T) {
  return (overrides?: Partial<T>) => Object.assign({}, defaultsFactory(), overrides);
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

export const fileDescriptor = factory<FileDescriptor>({
  name: 'fileName',
  included: true,
  mutated: true,
  kind: FileKind.Text
});

export const mutant = factory<Mutant>({
  mutatorName: 'foobarMutator',
  fileName: 'file',
  range: [0, 0],
  replacement: 'replacement'
});

export const logger = (): Mock<Logger> => {
  return {
    setLevel: sinon.stub(),
    isLevelEnabled: sinon.stub(),
    isTraceEnabled: sinon.stub(),
    isDebugEnabled: sinon.stub(),
    isInfoEnabled: sinon.stub(),
    isWarnEnabled: sinon.stub(),
    isErrorEnabled: sinon.stub(),
    isFatalEnabled: sinon.stub(),
    trace: sinon.stub(),
    debug: sinon.stub(),
    info: sinon.stub(),
    warn: sinon.stub(),
    error: sinon.stub(),
    fatal: sinon.stub()
  };
};

export const textFile = factory<TextFile>({
  name: 'file.js',
  content: '',
  mutated: true,
  included: true,
  kind: FileKind.Text
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
  totalInvalid: 0,
  totalValid: 0,
  totalUndetected: 0,
  runtimeErrors: 0,
  transpileErrors: 0,
  noCoverage: 0,
  mutationScore: 0,
  mutationScoreBasedOnCoveredCode: 0
});

export const testResult = factory<TestResult>({
  name: 'name',
  status: TestStatus.Success,
  timeSpentMs: 10
});

export const runResult = factoryMethod<RunResult>(() => ({
  tests: [testResult()],
  status: RunStatus.Complete
}));

export const file = factory<File>({
  name: 'file.js',
  content: '',
  mutated: true,
  included: true,
  kind: FileKind.Text
});

export const webFile = factory<WebFile>({
  name: 'http://example.org',
  mutated: false,
  included: true,
  kind: FileKind.Web
});

export const binaryFile = factory<BinaryFile>({
  name: 'file.js',
  content: Buffer.from(''),
  mutated: true,
  included: true,
  kind: FileKind.Binary
});


export const mutationScoreThresholds = factory<MutationScoreThresholds>({
  high: 80,
  low: 60,
  break: null
});

export const config = factory<Config>(new Config());

export const ALL_REPORTER_EVENTS: Array<keyof Reporter> =
  ['onSourceFileRead', 'onAllSourceFilesRead', 'onAllMutantsMatchedWithTests', 'onMutantTested', 'onAllMutantsTested', 'onScoreCalculated', 'wrapUp'];


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

export const sourceFile = () => new SourceFile(textFile());

export const testableMutant = (fileName = 'file') => new TestableMutant(mutant({
  range: [12, 13],
  replacement: '-',
  fileName
}), new SourceFile(
  textFile({ name: fileName, content: 'const a = 4 + 5' })
));

export const transpiledMutant = (fileName = 'file') =>
  new TranspiledMutant(testableMutant(fileName), transpileResult());