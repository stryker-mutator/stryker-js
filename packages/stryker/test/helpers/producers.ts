import { TestResult, TestStatus, RunResult, RunStatus } from 'stryker-api/test_runner';
import { Mutant } from 'stryker-api/mutant';
import { Config } from 'stryker-api/config';
import { Logger } from 'stryker-api/logging';
import { TestFramework, TestSelection } from 'stryker-api/test_framework';
import { MutantStatus, MatchedMutant, MutantResult, Reporter, ScoreResult } from 'stryker-api/report';
import { MutationScoreThresholds, File, Location } from 'stryker-api/core';
import TestableMutant from '../../src/TestableMutant';
import SourceFile from '../../src/SourceFile';
import TranspiledMutant from '../../src/TranspiledMutant';
import { FileCoverageData } from 'istanbul-lib-coverage';
import { CoverageMaps } from '../../src/transpiler/CoverageInstrumenterTranspiler';
import { MappedLocation } from '../../src/transpiler/SourceMapper';
import TranspileResult from '../../src/transpiler/TranspileResult';

export type Mock<T> = sinon.SinonStubbedInstance<T>;

export function mock<T>(constructorFn: sinon.StubbableType<T>): Mock<T> {
  return sandbox.createStubInstance(constructorFn);
}

/**
 * @description Checks if variable is a primitive
 * @param value
 */
function isPrimitive(value: any): boolean {
  return ['string', 'undefined', 'symbol', 'boolean'].indexOf(typeof value) > -1
    || (typeof value === 'number' && !isNaN(value)
    || value === null);
}

/**
 * Use this factory to create flat test data
 * @param defaults
 */
function factory<T>(defaults: T) {
  for (const key in defaults) {
    const value = defaults[key];
    if (!isPrimitive(value)) {
      throw Error(`Cannot create factory, as value for '${key}' is not a primitive type (use \`factoryMethod\` instead)`);
    }
  }

  return (overrides?: Partial<T>) => Object.assign({}, defaults, overrides);
}

/**
 * A 1x1 png base64 encoded
 */
export const PNG_BASE64_ENCODED = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAMSURBVBhXY/j//z8ABf4C/qc1gYQAAAAASUVORK5CYII=';

/**
 * Use this factory method to create deep test data
 * @param defaults
 */
function factoryMethod<T>(defaultsFactory: () => T) {
  return (overrides?: Partial<T>) => Object.assign({}, defaultsFactory(), overrides);
}

export const location = factoryMethod<Location>(() => ({ start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }));

export const mutantResult = factoryMethod<MutantResult>(() => ({
  id: '256',
  location: location(),
  mutatedLines: '',
  mutatorName: '',
  originalLines: '',
  range: [0, 0],
  replacement: '',
  sourceFilePath: '',
  status: MutantStatus.Killed,
  testsRan: ['']
}));

export const mutant = factoryMethod<Mutant>(() => ({
  fileName: 'file',
  mutatorName: 'foobarMutator',
  range: [0, 0],
  replacement: 'replacement'
}));

export const logger = (): Mock<Logger> => {
  return {
    debug: sandbox.stub(),
    error: sandbox.stub(),
    fatal: sandbox.stub(),
    info: sandbox.stub(),
    isDebugEnabled: sandbox.stub(),
    isErrorEnabled: sandbox.stub(),
    isFatalEnabled: sandbox.stub(),
    isInfoEnabled: sandbox.stub(),
    isTraceEnabled: sandbox.stub(),
    isWarnEnabled: sandbox.stub(),
    trace: sandbox.stub(),
    warn: sandbox.stub()
  };
};

export const mappedLocation = factoryMethod<MappedLocation>(() => ({
  fileName: 'file.js',
  location: location()
}));

export const coverageMaps = factoryMethod<CoverageMaps>(() => ({
  fnMap: {},
  statementMap: {}
}));

export const fileCoverageData = factoryMethod<FileCoverageData>(() => ({
  b: {},
  branchMap: {},
  f: {},
  fnMap: {},
  path: '',
  s: {},
  statementMap: {}
}));

export const testFramework = factoryMethod<TestFramework>(() => ({
  beforeEach(codeFragment: string) { return `beforeEach(){ ${codeFragment}}`; },
  afterEach(codeFragment: string) { return `afterEach(){ ${codeFragment}}`; },
  filter(selections: TestSelection[]) { return `filter: ${selections}`; }
}));

export const scoreResult = factoryMethod<ScoreResult>(() => ({
  childResults: [],
  killed: 0,
  mutationScore: 0,
  mutationScoreBasedOnCoveredCode: 0,
  name: 'name',
  noCoverage: 0,
  path: 'path',
  representsFile: true,
  runtimeErrors: 0,
  survived: 0,
  timedOut: 0,
  totalCovered: 0,
  totalDetected: 0,
  totalInvalid: 0,
  totalMutants: 0,
  totalUndetected: 0,
  totalValid: 0,
  transpileErrors: 0
}));

export const testResult = factory<TestResult>({
  name: 'name',
  status: TestStatus.Success,
  timeSpentMs: 10
});

export const runResult = factoryMethod<RunResult>(() => ({
  status: RunStatus.Complete,
  tests: [testResult()]
}));

export const mutationScoreThresholds = factory<MutationScoreThresholds>({
  break: null,
  high: 80,
  low: 60
});

export const config = factoryMethod<Config>(() => new Config());

export const ALL_REPORTER_EVENTS: (keyof Reporter)[] =
  ['onSourceFileRead', 'onAllSourceFilesRead', 'onAllMutantsMatchedWithTests', 'onMutantTested', 'onAllMutantsTested', 'onScoreCalculated', 'wrapUp'];

export function matchedMutant(numberOfTests: number, mutantId = numberOfTests.toString()): MatchedMutant {
  const scopedTestIds: number[] = [];
  for (let i = 0; i < numberOfTests; i++) {
    scopedTestIds.push(1);
  }
  return {
    fileName: '',
    id: mutantId,
    mutatorName: '',
    replacement: '',
    scopedTestIds,
    timeSpentScopedTests: 0
  };
}

export function file() {
  return new File('', '');
}

export const transpileResult = factoryMethod<TranspileResult>(() => ({
  error: null,
  outputFiles: [file(), file()]
}));

export const sourceFile = () => new SourceFile(file());

export const testableMutant = (fileName = 'file', mutatorName = 'foobarMutator') => new TestableMutant('1337', mutant({
  fileName,
  mutatorName,
  range: [12, 13],
  replacement: '-'
}), new SourceFile(
  new File(fileName, Buffer.from('const a = 4 + 5'))
));

export const transpiledMutant = (fileName = 'file') =>
  new TranspiledMutant(testableMutant(fileName), transpileResult(), true);

export function createFileNotFoundError(): NodeJS.ErrnoException {
  return createErrnoException('ENOENT');
}

export function createFileAlreadyExistsError(): NodeJS.ErrnoException {
  return createErrnoException('EEXIST');
}

export function createIsDirError(): NodeJS.ErrnoException {
  return createErrnoException('EISDIR');
}

function createErrnoException(errorCode: string) {
  const fileNotFoundError: NodeJS.ErrnoException = new Error('');
  fileNotFoundError.code = errorCode;
  return fileNotFoundError;
}
