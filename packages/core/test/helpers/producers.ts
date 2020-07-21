import { ClearTextReporterOptions } from '@stryker-mutator/api/core';
import { factory } from '@stryker-mutator/test-helpers';
import { Logger } from 'log4js';
import * as sinon from 'sinon';
import { ReplaySubject } from 'rxjs';
import { TestRunner2 } from '@stryker-mutator/api/test_runner2';
import { Checker } from '@stryker-mutator/api/check';

import { MutantTestCoverage } from '../../src/mutants/findMutantTestCoverage';
import { Worker, Pool, ConcurrencyTokenProvider } from '../../src/concurrent';

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

export type PoolMock<T extends Worker> = sinon.SinonStubbedInstance<Pool<T>> & {
  worker$: ReplaySubject<sinon.SinonStubbedInstance<T>>;
};

export type ConcurrencyTokenProviderMock = sinon.SinonStubbedInstance<ConcurrencyTokenProvider> & {
  testRunnerToken$: ReplaySubject<number>;
  checkerToken$: ReplaySubject<number>;
};

export function createConcurrencyTokenProviderMock(): ConcurrencyTokenProviderMock {
  return {
    checkerToken$: new ReplaySubject(),
    testRunnerToken$: new ReplaySubject(),
    dispose: sinon.stub(),
    freeCheckers: sinon.stub(),
  };
}

export function createTestRunnerPoolMock(): PoolMock<TestRunner2> {
  return {
    dispose: sinon.stub(),
    recycle: sinon.stub(),
    init: sinon.stub(),
    worker$: new ReplaySubject<sinon.SinonStubbedInstance<TestRunner2>>(),
  };
}

export function createCheckerPoolMock(): PoolMock<Checker> {
  return {
    dispose: sinon.stub(),
    recycle: sinon.stub(),
    init: sinon.stub(),
    worker$: new ReplaySubject<sinon.SinonStubbedInstance<Checker>>(),
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
    category: 'category',
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
