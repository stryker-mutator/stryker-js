import ajvModule from 'ajv';
import {
  Location,
  MutationScoreThresholds,
  StrykerOptions,
  strykerCoreSchema,
  WarningOptions,
  Mutant,
  MutantTestCoverage,
  MutantResult,
  MutantCoverage,
  schema,
  MutantRunPlan,
  PlanKind,
  MutantEarlyResultPlan,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { DryRunCompletedEvent, MutationTestingPlanReadyEvent, Reporter, RunTiming } from '@stryker-mutator/api/report';
import { calculateMutationTestMetrics, Metrics, MetricsResult, MutationTestMetricsResult } from 'mutation-testing-metrics';
import sinon from 'sinon';
import { Injector } from 'typed-inject';
import {
  MutantRunOptions,
  DryRunOptions,
  DryRunStatus,
  TestRunner,
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
  TestStatus,
  TestResult,
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';
import { Checker, CheckResult, CheckStatus, FailedCheckResult } from '@stryker-mutator/api/check';

const Ajv = ajvModule.default;
const ajv = new Ajv({ useDefaults: true, strict: false });

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

export const warningOptions = factoryMethod<WarningOptions>(() => ({
  unknownOptions: true,
  preprocessorErrors: true,
  unserializableOptions: true,
  slow: true,
}));

export const killedMutantResult = (overrides?: Partial<Omit<MutantResult, 'status'>>): MutantResult =>
  mutantResult({ ...overrides, status: 'Killed', killedBy: ['45'], testsCompleted: 2 });
export const survivedMutantResult = (overrides?: Partial<Omit<MutantResult, 'status'>>): MutantResult =>
  mutantResult({ ...overrides, status: 'Survived', killedBy: ['45'], testsCompleted: 2 });
export const timeoutMutantResult = (overrides?: Partial<Omit<MutantResult, 'status'>>): MutantResult =>
  mutantResult({ ...overrides, status: 'Timeout', statusReason: 'expected error' });
export const runtimeErrorMutantResult = (overrides?: Partial<Omit<MutantResult, 'status'>>): MutantResult =>
  mutantResult({ ...overrides, status: 'RuntimeError', statusReason: 'expected error' });
export const ignoredMutantResult = (overrides?: Partial<Omit<MutantResult, 'status'>>): MutantResult =>
  mutantResult({ ...overrides, status: 'Ignored', statusReason: 'Ignored by "fooMutator" in excludedMutations' });
export const noCoverageMutantResult = (overrides?: Partial<Omit<MutantResult, 'status'>>): MutantResult =>
  mutantResult({ ...overrides, status: 'NoCoverage' });

export const mutantResult = factoryMethod<MutantResult>(() => ({
  id: '256',
  location: location(),
  mutatorName: '',
  range: [0, 0],
  replacement: '',
  fileName: 'file.js',
  status: 'Survived',
  coveredBy: ['1', '2'],
  testsCompleted: 2,
  static: false,
}));

export const mutationTestReportSchemaMutantResult = factoryMethod<schema.MutantResult>(() => ({
  id: '256',
  location: location(),
  mutatedLines: '',
  mutatorName: '',
  originalLines: '',
  range: [0, 0],
  replacement: '',
  sourceFilePath: '',
  status: 'Killed',
  testsRan: [''],
}));

export const mutationTestReportSchemaFileResult = factoryMethod<schema.FileResult>(() => ({
  language: 'javascript',
  mutants: [mutationTestReportSchemaMutantResult()],
  source: 'export function add (a, b) { return a + b; }',
}));

export const mutationTestReportSchemaTestFile = factoryMethod<schema.TestFile>(() => ({
  tests: [],
  source: '',
}));

export const mutationTestReportSchemaTestDefinition = factoryMethod<schema.TestDefinition>(() => ({
  id: '4',
  name: 'foo should be bar',
}));

export const mutationTestReportSchemaMutationTestResult = factoryMethod<schema.MutationTestResult>(() => ({
  files: {
    'fileA.js': mutationTestReportSchemaFileResult(),
  },
  schemaVersion: '1',
  thresholds: {
    high: 81,
    low: 19,
  },
}));

export const mutationTestMetricsResult = factoryMethod<MutationTestMetricsResult>(() =>
  calculateMutationTestMetrics(mutationTestReportSchemaMutationTestResult()),
);

export const mutant = factoryMethod<Mutant>(() => ({
  id: '42',
  fileName: 'file',
  mutatorName: 'foobarMutator',
  location: location(),
  replacement: 'replacement',
}));

export const metrics = factoryMethod<Metrics>(() => ({
  pending: 0,
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

export const metricsResult = factoryMethod<MetricsResult>(() => new MetricsResult('', [], metrics({})));

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

export function testRunner(index = 0): sinon.SinonStubbedInstance<Required<TestRunner> & { index: number }> {
  return {
    index,
    capabilities: sinon.stub(),
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
  id: 'spec1',
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
  disableBail: false,
  mutantActivation: 'static',
  reloadEnvironment: false,
}));

export const dryRunOptions = factoryMethod<DryRunOptions>(() => ({
  coverageAnalysis: 'off',
  timeout: 2000,
  disableBail: false,
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
  killedBy: ['spec1'],
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

export const strykerWithPluginOptions = <T>(pluginOptions: T): StrykerOptions & T => {
  return { ...strykerOptions(), ...pluginOptions };
};

export const ALL_REPORTER_EVENTS: Array<keyof Reporter> = [
  'onDryRunCompleted',
  'onMutationTestingPlanReady',
  'onMutantTested',
  'onMutationTestReportReady',
  'wrapUp',
];

export function reporter(name = 'fooReporter'): sinon.SinonStubbedInstance<Required<Reporter>> {
  const reporters = { name } as any;
  ALL_REPORTER_EVENTS.forEach((event) => (reporters[event] = sinon.stub()));
  return reporters;
}

export const mutantTestCoverage = factoryMethod<MutantTestCoverage>(() => ({
  coveredBy: undefined,
  fileName: '',
  id: '1',
  mutatorName: '',
  static: false,
  replacement: '',
  location: location(),
}));

export const ignoredMutantTestCoverage = factoryMethod<MutantTestCoverage & { status: 'Ignored' }>(() => ({
  status: 'Ignored',
  coveredBy: undefined,
  fileName: '',
  id: '1',
  mutatorName: '',
  static: false,
  replacement: '',
  location: location(),
}));

export const mutantRunPlan = factoryMethod<MutantRunPlan>(() => ({
  plan: PlanKind.Run,
  netTime: 20,
  mutant: mutantTestCoverage(),
  runOptions: mutantRunOptions(),
}));

export const mutantEarlyResultPlan = factoryMethod<MutantEarlyResultPlan>(() => ({
  plan: PlanKind.EarlyResult,
  mutant: { ...mutantTestCoverage(), status: 'Ignored' },
}));

export const mutationTestingPlanReadyEvent = factoryMethod<MutationTestingPlanReadyEvent>(() => ({
  mutantPlans: [mutantRunPlan()],
}));

export const runTiming = factoryMethod<RunTiming>(() => ({
  net: 1000,
  overhead: 765,
}));

export const testRunnerCapabilities = factoryMethod<TestRunnerCapabilities>(() => ({ reloadEnvironment: false }));

export const dryRunCompletedEvent = factoryMethod<DryRunCompletedEvent>(() => ({
  result: completeDryRunResult(),
  timing: runTiming(),
  capabilities: testRunnerCapabilities(),
}));

export function injector<T = unknown>(): sinon.SinonStubbedInstance<Injector<T>> {
  const injectorMock: sinon.SinonStubbedInstance<Injector<T>> = {
    dispose: sinon.stub(),
    injectClass: sinon.stub<any>(),
    injectFunction: sinon.stub<any>(),
    provideClass: sinon.stub<any>(),
    provideFactory: sinon.stub<any>(),
    provideValue: sinon.stub<any>(),
    resolve: sinon.stub<any>(),
  };
  injectorMock.provideClass.returnsThis();
  injectorMock.provideFactory.returnsThis();
  injectorMock.provideValue.returnsThis();
  return injectorMock;
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
  const fileNotFoundErrorInstance: NodeJS.ErrnoException = new Error('');
  fileNotFoundErrorInstance.code = errorCode;
  return fileNotFoundErrorInstance;
}
