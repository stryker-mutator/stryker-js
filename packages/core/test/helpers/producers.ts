import { File, ClearTextReporterOptions } from '@stryker-mutator/api/core';
import { factory } from '@stryker-mutator/test-helpers';
import { FileCoverageData } from 'istanbul-lib-coverage';
import { Logger } from 'log4js';
import * as sinon from 'sinon';

import { ReplaySubject } from 'rxjs';

import { TestRunner2 } from '@stryker-mutator/api/test_runner2';

import SourceFile from '../../src/SourceFile';
import TestableMutant from '../../src/TestableMutant';
import TranspiledMutant from '../../src/TranspiledMutant';
import { CoverageMaps } from '../../src/transpiler/CoverageInstrumenterTranspiler';
import { MappedLocation } from '../../src/transpiler/SourceMapper';
import TranspileResult from '../../src/transpiler/TranspileResult';
import { TestRunnerPool } from '../../src/test-runner-2';
import { MutantTestCoverage } from '../../src/mutants/MutantTestMatcher2';

export type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type Mock<T> = Mutable<sinon.SinonStubbedInstance<T>>;

export function mock<T>(constructorFn: sinon.StubbableType<T>): Mock<T> {
  return sinon.createStubInstance(constructorFn);
}

/**
 * Use this factory method to create deep test data
 * @param defaults
 */
function factoryMethod<T>(defaultsFactory: () => T) {
  return (overrides?: Partial<T>) => Object.assign({}, defaultsFactory(), overrides);
}

export const createClearTextReporterOptions = factoryMethod<ClearTextReporterOptions>(() => ({
  allowColor: true,
  logTests: true,
  maxTestsToLog: 3,
}));

export type TestRunnerPoolMock = sinon.SinonStubbedInstance<TestRunnerPool> & {
  testRunner$: ReplaySubject<sinon.SinonStubbedInstance<Required<TestRunner2>>>;
};

export function createTestRunnerPoolMock(): TestRunnerPoolMock {
  return {
    dispose: sinon.stub(),
    recycle: sinon.stub(),
    testRunner$: new ReplaySubject<sinon.SinonStubbedInstance<Required<TestRunner2>>>(),
  };
}

export function createMutantTestCoverage(overrides?: Partial<MutantTestCoverage>): MutantTestCoverage {
  return {
    coveredByTests: true,
    mutant: factory.mutant(),
    estimatedNetTime: 10,
    ...overrides,
  };
}

export const logger = (): Mock<Logger> => {
  return {
    _log: sinon.stub(),
    addContext: sinon.stub(),
    clearContext: sinon.stub(),
    debug: sinon.stub(),
    error: sinon.stub(),
    fatal: sinon.stub(),
    info: sinon.stub(),
    isDebugEnabled: sinon.stub(),
    isErrorEnabled: sinon.stub(),
    isFatalEnabled: sinon.stub(),
    isInfoEnabled: sinon.stub(),
    isLevelEnabled: sinon.stub(),
    isTraceEnabled: sinon.stub(),
    isWarnEnabled: sinon.stub(),
    level: 'level',
    log: sinon.stub(),
    mark: sinon.stub(),
    new: sinon.stub(),
    removeContext: sinon.stub(),
    setParseCallStackFunction: sinon.stub(),
    trace: sinon.stub(),
    warn: sinon.stub(),
  };
};

export const mappedLocation = factoryMethod<MappedLocation>(() => ({
  fileName: 'file.js',
  location: factory.location(),
}));

export const coverageMaps = factoryMethod<CoverageMaps>(() => ({
  fnMap: {},
  statementMap: {},
}));

export const fileCoverageData = factoryMethod<FileCoverageData>(() => ({
  b: {},
  branchMap: {},
  f: {},
  fnMap: {},
  path: '',
  s: {},
  statementMap: {},
}));

export const transpileResult = factoryMethod<TranspileResult>(() => ({
  error: null,
  outputFiles: [factory.file(), factory.file()],
}));

export const sourceFile = () => new SourceFile(factory.file());

export const testableMutant = (fileName = 'file', mutatorName = 'foobarMutator') =>
  new TestableMutant(
    '1337',
    factory.mutant({
      fileName,
      mutatorName,
      range: [12, 13],
      replacement: '-',
    }),
    new SourceFile(new File(fileName, Buffer.from('const a = 4 + 5')))
  );

export const transpiledMutant = (fileName = 'file') => new TranspiledMutant(testableMutant(fileName), transpileResult(), true);
