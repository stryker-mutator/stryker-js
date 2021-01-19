import { CpuInfo } from 'os';

import { ClearTextReporterOptions } from '@stryker-mutator/api/core';
import { factory } from '@stryker-mutator/test-helpers';
import { Logger } from 'log4js';
import * as sinon from 'sinon';
import { ReplaySubject } from 'rxjs';
import { TestRunner } from '@stryker-mutator/api/test-runner';
import { Checker } from '@stryker-mutator/api/check';

import { MutantTestCoverage } from '../../src/mutants/find-mutant-test-coverage';
import { Pool, ConcurrencyTokenProvider } from '../../src/concurrent';

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

export function createTestRunnerPoolMock(): sinon.SinonStubbedInstance<Pool<TestRunner>> {
  return {
    dispose: sinon.stub(),
    init: sinon.stub(),
    schedule: sinon.stub(),
  };
}

export function createCheckerPoolMock(): sinon.SinonStubbedInstance<Pool<Checker>> {
  return {
    dispose: sinon.stub(),
    init: sinon.stub(),
    schedule: sinon.stub(),
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

export function createCpuInfo(overrides?: Partial<CpuInfo>): CpuInfo {
  return {
    model: 'x86',
    speed: 20000,
    times: {
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      irq: 0,
    },
    ...overrides,
  };
}
