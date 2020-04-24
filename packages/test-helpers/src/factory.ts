import Ajv = require('ajv');
import { ConfigEditor } from '@stryker-mutator/api/config';
import {
  File,
  Location,
  MutationScoreThresholds,
  StrykerOptions,
  MutatorDescriptor,
  strykerCoreSchema,
  WarningOptions,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { Mutant } from '@stryker-mutator/api/mutant';
import { MatchedMutant, MutantResult, MutantStatus, mutationTestReportSchema, Reporter } from '@stryker-mutator/api/report';
import { TestFramework, TestSelection } from '@stryker-mutator/api/test_framework';
import { RunResult, RunStatus, TestResult, TestStatus } from '@stryker-mutator/api/test_runner';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { Metrics, MetricsResult } from 'mutation-testing-metrics';
import * as sinon from 'sinon';
import { Injector } from 'typed-inject';
import { OptionsEditor } from '@stryker-mutator/api/src/core/OptionsEditor';
import { PluginResolver } from '@stryker-mutator/api/plugin';

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
  excessOptions: true,
}));

export const mutantResult = factoryMethod<MutantResult>(() => ({
  id: '256',
  location: location(),
  mutatedLines: '',
  mutatorName: '',
  originalLines: '',
  range: [0, 0],
  replacement: '',
  sourceFilePath: 'file.js',
  status: MutantStatus.Killed,
  testsRan: [''],
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
  fileName: 'file',
  mutatorName: 'foobarMutator',
  range: [0, 0],
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

export function testFramework(): TestFramework {
  return {
    beforeEach(codeFragment: string) {
      return `beforeEach(){ ${codeFragment}}`;
    },
    afterEach(codeFragment: string) {
      return `afterEach(){ ${codeFragment}}`;
    },
    filter(selections: TestSelection[]) {
      return `filter: ${selections}`;
    },
  };
}

export const testResult = factoryMethod<TestResult>(() => ({
  name: 'name',
  status: TestStatus.Success,
  timeSpentMs: 10,
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

export function configEditor(): sinon.SinonStubbedInstance<ConfigEditor> {
  return {
    edit: sinon.stub(),
  };
}
export function optionsEditor(): sinon.SinonStubbedInstance<OptionsEditor> {
  return {
    edit: sinon.stub(),
  };
}

export function transpiler(): sinon.SinonStubbedInstance<Transpiler> {
  return {
    transpile: sinon.stub(),
  };
}

export function matchedMutant(numberOfTests: number, mutantId = numberOfTests.toString(), runAllTests = false): MatchedMutant {
  const scopedTestIds: number[] = [];
  for (let i = 0; i < numberOfTests; i++) {
    scopedTestIds.push(1);
  }
  return {
    fileName: '',
    id: mutantId,
    mutatorName: '',
    runAllTests,
    replacement: '',
    scopedTestIds,
    timeSpentScopedTests: 0,
  };
}

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
