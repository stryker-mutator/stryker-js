import Ajv = require('ajv');
import {
  File,
  Location,
  MutationScoreThresholds,
  StrykerOptions,
  MutatorDescriptor,
  strykerCoreSchema,
  WarningOptions,
  Mutant,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import {
  MatchedMutant,
  MutantStatus,
  mutationTestReportSchema,
  Reporter,
  KilledMutantResult,
  InvalidMutantResult,
  UndetectedMutantResult,
  TimeoutMutantResult,
} from '@stryker-mutator/api/report';
import { RunResult, RunStatus, TestResult, TestStatus } from '@stryker-mutator/api/test_runner';
import { Metrics, MetricsResult } from 'mutation-testing-metrics';
import * as sinon from 'sinon';
import { Injector } from 'typed-inject';
import { PluginResolver } from '@stryker-mutator/api/plugin';
import {
  MutantRunOptions,
  DryRunOptions,
  DryRunStatus,
  TestRunner2,
  SuccessTestResult,
  FailedTestResult,
  SkippedTestResult,
  CompleteDryRunResult,
  ErrorDryRunResult,
  TimeoutDryRunResult,
  KilledMutantRunResult,
  SurvivedMutantRunResult,
  MutantRunStatus,
  TimeoutMutantRunResult,
  ErrorMutantRunResult,
  MutantCoverage,
} from '@stryker-mutator/api/test_runner2';
import { Checker, CheckResult, CheckStatus, FailedCheckResult } from '@stryker-mutator/api/check';

const ajv = new Ajv({ useDefaults: true });

/**
 * This validator will fill in the defaults of stryker options as registered in the schema.
 */
function strykerOptionsValidator(overrides: Partial<StrykerOptions>): asserts overrides is StrykerOptions {
  const ajvValidator = ajv.compile(strykerCoreSchema);
  if (!ajvValidator(overrides)) {
    throw new Error('Unknown stryker options ' + ajv.errorsText(ajvValidator.errors));
  }
}

/**
 * A 1x1 png base64 encoded
 */
export const PNG_BASE64_ENCODED =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAMSURBVBhXY/j//z8ABf4C/qc1gYQAAAAASUVORK5CYII=';

/**
 * Use this factory method to create deep test data
 * @param defaults
 */
function factoryMethod<T>(defaultsFactory: () => T) {
  return (overrides?: Partial<T>): T => Object.assign({}, defaultsFactory(), overrides);
}

export const location = factoryMethod<Location>(() => ({ start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }));

export function pluginResolver(): sinon.SinonStubbedInstance<PluginResolver> {
  return {
    resolve: sinon.stub(),
    resolveAll: sinon.stub(),
    resolveValidationSchemaContributions: sinon.stub(),
  };
}

export const warningOptions = factoryMethod<WarningOptions>(() => ({
  unknownOptions: true,
}));

export const killedMutantResult = factoryMethod<KilledMutantResult>(() => ({
  id: '256',
  location: location(),
  mutatedLines: '',
  mutatorName: '',
  originalLines: '',
  range: [0, 0],
  replacement: '',
  fileName: 'file.js',
  status: MutantStatus.Killed,
  killedBy: '',
  nrOfTestsRan: 2,
}));
export const timeoutMutantResult = factoryMethod<TimeoutMutantResult>(() => ({
  id: '256',
  location: location(),
  mutatedLines: '',
  mutatorName: '',
  originalLines: '',
  range: [0, 0],
  replacement: '',
  fileName: 'file.js',
  status: MutantStatus.TimedOut,
  nrOfTestsRan: 0,
}));

export const invalidMutantResult = factoryMethod<InvalidMutantResult>(() => ({
  id: '256',
  location: location(),
  mutatedLines: '',
  mutatorName: '',
  originalLines: '',
  range: [0, 0],
  replacement: '',
  fileName: 'file.js',
  status: MutantStatus.RuntimeError,
  errorMessage: 'expected error',
  nrOfTestsRan: 2,
}));

export const undetectedMutantResult = factoryMethod<UndetectedMutantResult>(() => ({
  id: '256',
  location: location(),
  mutatedLines: '',
  mutatorName: '',
  originalLines: '',
  range: [0, 0],
  replacement: '',
  fileName: 'file.js',
  status: MutantStatus.NoCoverage,
  testFilter: undefined,
  nrOfTestsRan: 2,
}));

export const mutationTestReportSchemaMutantResult = factoryMethod<mutationTestReportSchema.MutantResult>(() => ({
  id: '256',
  location: location(),
  mutatedLines: '',
  mutatorName: '',
  originalLines: '',
  range: [0, 0],
  replacement: '',
  sourceFilePath: '',
  status: mutationTestReportSchema.MutantStatus.Killed,
  testsRan: [''],
}));

export const mutationTestReportSchemaFileResult = factoryMethod<mutationTestReportSchema.FileResult>(() => ({
  language: 'javascript',
  mutants: [mutationTestReportSchemaMutantResult()],
  source: 'export function add (a, b) { return a + b; }',
}));

export const mutationTestReportSchemaMutationTestResult = factoryMethod<mutationTestReportSchema.MutationTestResult>(() => ({
  files: {
    'fileA.js': mutationTestReportSchemaFileResult(),
  },
  schemaVersion: '1',
  thresholds: {
    high: 81,
    low: 19,
  },
}));

export const mutant = factoryMethod<Mutant>(() => ({
  id: 42,
  fileName: 'file',
  mutatorName: 'foobarMutator',
  range: [0, 0],
  location: location(),
  replacement: 'replacement',
}));

export const metrics = factoryMethod<Metrics>(() => ({
  compileErrors: 0,
  killed: 0,
  mutationScore: 0,
  mutationScoreBasedOnCoveredCode: 0,
  noCoverage: 0,
  runtimeErrors: 0,
  survived: 0,
  timeout: 0,
  ignored: 0,
  totalCovered: 0,
  totalDetected: 0,
  totalInvalid: 0,
  totalMutants: 0,
  totalUndetected: 0,
  totalValid: 0,
}));

export const metricsResult = factoryMethod<MetricsResult>(() => ({
  childResults: [],
  metrics: metrics({}),
  name: '',
}));

export function logger(): sinon.SinonStubbedInstance<Logger> {
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
    warn: sinon.stub(),
  };
}

export function testRunner(): sinon.SinonStubbedInstance<Required<TestRunner2>> {
  return {
    init: sinon.stub(),
    dryRun: sinon.stub(),
    mutantRun: sinon.stub(),
    dispose: sinon.stub(),
  };
}

export function checker(): sinon.SinonStubbedInstance<Checker> {
  return {
    check: sinon.stub(),
    init: sinon.stub(),
  };
}

export const checkResult = factoryMethod<CheckResult>(() => ({
  status: CheckStatus.Passed,
}));

export const failedCheckResult = factoryMethod<FailedCheckResult>(() => ({
  status: CheckStatus.CompileError,
  reason: 'Cannot call "foo" of undefined',
}));

export const testResult = factoryMethod<TestResult>(() => ({
  name: 'name',
  status: TestStatus.Success,
  timeSpentMs: 10,
}));
export const successTestResult = factoryMethod<SuccessTestResult>(() => ({
  id: 'spec1',
  name: 'foo should be bar',
  status: TestStatus.Success,
  timeSpentMs: 32,
}));
export const failedTestResult = factoryMethod<FailedTestResult>(() => ({
  id: 'spec2',
  name: 'foo should be bar',
  status: TestStatus.Failed,
  timeSpentMs: 32,
  failureMessage: 'foo was baz',
}));
export const skippedTestResult = factoryMethod<SkippedTestResult>(() => ({
  id: 'spec31',
  status: TestStatus.Skipped,
  timeSpentMs: 0,
  name: 'qux should be quux',
}));

export const mutantRunOptions = factoryMethod<MutantRunOptions>(() => ({
  activeMutant: mutant(),
  timeout: 2000,
  sandboxFileName: '.stryker-tmp/sandbox123/file',
}));

export const dryRunOptions = factoryMethod<DryRunOptions>(() => ({
  coverageAnalysis: 'off',
  timeout: 2000,
}));

export const completeDryRunResult = factoryMethod<CompleteDryRunResult>(() => ({
  status: DryRunStatus.Complete,
  tests: [],
}));

export const mutantCoverage = factoryMethod<MutantCoverage>(() => ({
  perTest: {},
  static: {},
}));

export const errorDryRunResult = factoryMethod<ErrorDryRunResult>(() => ({
  status: DryRunStatus.Error,
  errorMessage: 'example error',
}));

export const timeoutDryRunResult = factoryMethod<TimeoutDryRunResult>(() => ({
  status: DryRunStatus.Timeout,
}));

export const killedMutantRunResult = factoryMethod<KilledMutantRunResult>(() => ({
  status: MutantRunStatus.Killed,
  killedBy: 'spec1',
  failureMessage: 'foo should be bar',
  nrOfTests: 1,
}));

export const survivedMutantRunResult = factoryMethod<SurvivedMutantRunResult>(() => ({
  status: MutantRunStatus.Survived,
  nrOfTests: 2,
}));

export const timeoutMutantRunResult = factoryMethod<TimeoutMutantRunResult>(() => ({
  status: MutantRunStatus.Timeout,
}));

export const errorMutantRunResult = factoryMethod<ErrorMutantRunResult>(() => ({
  status: MutantRunStatus.Error,
  errorMessage: 'Cannot find foo of undefined',
}));

export const runResult = factoryMethod<RunResult>(() => ({
  status: RunStatus.Complete,
  tests: [testResult()],
}));

export const mutationScoreThresholds = factoryMethod<MutationScoreThresholds>(() => ({
  break: null,
  high: 80,
  low: 60,
}));

export const strykerOptions = factoryMethod<StrykerOptions>(() => {
  const options: Partial<StrykerOptions> = {};
  strykerOptionsValidator(options);
  return options;
});

export const strykerWithPluginOptions = <T>(pluginOptions: T): T & StrykerOptions => {
  return { ...strykerOptions(), ...pluginOptions };
};

export const mutatorDescriptor = factoryMethod<MutatorDescriptor>(() => ({
  excludedMutations: [],
  name: 'fooMutator',
  plugins: null,
}));

export const ALL_REPORTER_EVENTS: Array<keyof Reporter> = [
  'onSourceFileRead',
  'onAllSourceFilesRead',
  'onAllMutantsMatchedWithTests',
  'onMutantTested',
  'onAllMutantsTested',
  'onMutationTestReportReady',
  'wrapUp',
];

export function reporter(name = 'fooReporter'): sinon.SinonStubbedInstance<Required<Reporter>> {
  const reporter = { name } as any;
  ALL_REPORTER_EVENTS.forEach((event) => (reporter[event] = sinon.stub()));
  return reporter;
}

export const matchedMutant = factoryMethod<MatchedMutant>(() => ({
  testFilter: undefined,
  fileName: '',
  id: '1',
  mutatorName: '',
  runAllTests: false,
  replacement: '',
  timeSpentScopedTests: 0,
}));

export function injector(): sinon.SinonStubbedInstance<Injector> {
  const injectorMock: sinon.SinonStubbedInstance<Injector> = {
    dispose: sinon.stub(),
    injectClass: sinon.stub(),
    injectFunction: sinon.stub(),
    provideClass: sinon.stub(),
    provideFactory: sinon.stub(),
    provideValue: sinon.stub(),
    resolve: sinon.stub(),
  };
  injectorMock.provideClass.returnsThis();
  injectorMock.provideFactory.returnsThis();
  injectorMock.provideValue.returnsThis();
  return injectorMock;
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
