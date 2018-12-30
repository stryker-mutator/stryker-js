import { TestResult, TestStatus, RunResult, RunStatus } from 'stryker-api/test_runner';
import { Mutant } from 'stryker-api/mutant';
import { Config } from 'stryker-api/config';
import { Logger } from 'stryker-api/logging';
import { TestFramework, TestSelection } from 'stryker-api/test_framework';
import { MutantStatus, MatchedMutant, MutantResult, Reporter, ScoreResult } from 'stryker-api/report';
import { MutationScoreThresholds, File, Location, StrykerOptions, LogLevel } from 'stryker-api/core';
import * as sinon from 'sinon';

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

export const logger = (): sinon.SinonStubbedInstance<Logger> => {
  return {
    debug: sinon.stub(),
    error: sinon.stub(),
    fatal: sinon.stub(),
    info: sinon.stub(),
    isDebugEnabled: sinon.stub(),
    isErrorEnabled: sinon.stub(),
    isFatalEnabled: sinon.stub(),
    isInfoEnabled: sinon.stub(),
    isTraceEnabled: sinon.stub(),
    isWarnEnabled: sinon.stub(),
    trace: sinon.stub(),
    warn: sinon.stub()
  };
};

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

export const testResult = factoryMethod<TestResult>(() => ({
  name: 'name',
  status: TestStatus.Success,
  timeSpentMs: 10
}));

export const runResult = factoryMethod<RunResult>(() => ({
  status: RunStatus.Complete,
  tests: [testResult()]
}));

export const mutationScoreThresholds = factoryMethod<MutationScoreThresholds>(() => ({
  break: null,
  high: 80,
  low: 60
}));

export const strykerOptions = factoryMethod<StrykerOptions>(() => ({
  allowConsoleColors: true,
  coverageAnalysis: 'off',
  fileLogLevel: LogLevel.Off,
  logLevel: LogLevel.Information,
  maxConcurrentTestRunners: Infinity,
  mutate: ['src/**/*.js'],
  mutator: 'javascript',
  plugins: [],
  reporters: [],
  symlinkNodeModules: true,
  testRunner: 'command',
  thresholds: {
    break: 20,
    high: 80,
    low: 30
  },
  timeoutFactor: 1.5,
  timeoutMS: 5000,
  transpilers: []
}));

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

export function fileNotFoundError(): NodeJS.ErrnoException {
  return createErrnoException('ENOENT');
}

export function fileAlreadyExistsError(): NodeJS.ErrnoException {
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
