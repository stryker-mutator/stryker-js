import { EOL } from 'os';

import { Injector } from 'typed-inject';
import { factory, testInjector } from '@stryker-mutator/test-helpers';

import { Mutant } from '@stryker-mutator/api/core';

import sinon = require('sinon');

import { TestRunner2, CompleteDryRunResult, ErrorDryRunResult, TimeoutDryRunResult } from '@stryker-mutator/api/test_runner2';

import { expect } from 'chai';

import Timer from '../../../src/utils/Timer';
import { DryRunExecutor } from '../../../src/process';
import { coreTokens } from '../../../src/di';
import { ConfigError } from '../../../src/errors';
import { ConcurrencyTokenProvider } from '../../../src/concurrent';
import { createTestRunnerPoolMock, PoolMock } from '../../helpers/producers';

describe(DryRunExecutor.name, () => {
  let injectorMock: sinon.SinonStubbedInstance<Injector>;
  let testRunnerPoolMock: PoolMock<TestRunner2>;
  let sut: DryRunExecutor;
  let timerMock: sinon.SinonStubbedInstance<Timer>;
  let mutants: Mutant[];
  let testRunnerMock: sinon.SinonStubbedInstance<Required<TestRunner2>>;
  let concurrencyTokenProviderMock: sinon.SinonStubbedInstance<ConcurrencyTokenProvider>;

  beforeEach(() => {
    timerMock = sinon.createStubInstance(Timer);
    testRunnerMock = factory.testRunner();
    testRunnerPoolMock = createTestRunnerPoolMock();
    testRunnerPoolMock.worker$.next(testRunnerMock);
    concurrencyTokenProviderMock = sinon.createStubInstance(ConcurrencyTokenProvider);
    mutants = [];
    injectorMock = factory.injector();
    injectorMock.resolve.withArgs(coreTokens.testRunnerPool).returns(testRunnerPoolMock);
    sut = new DryRunExecutor(injectorMock, testInjector.logger, testInjector.options, timerMock, mutants, concurrencyTokenProviderMock);
  });

  it('should pass through any rejections', async () => {
    const expectedError = new Error('expected error');
    testRunnerMock.dryRun.rejects(expectedError);
    await expect(sut.execute()).rejectedWith(expectedError);
  });

  describe('when the dryRun completes', () => {
    let runResult: CompleteDryRunResult;

    beforeEach(() => {
      runResult = factory.completeDryRunResult();
      testRunnerMock.dryRun.resolves(runResult);
    });

    describe('with successful tests', () => {
      it('should calculate the overhead time milliseconds', async () => {
        // Arrange
        runResult.tests.push(factory.successTestResult({ timeSpentMs: 10 }));
        runResult.tests.push(factory.successTestResult({ timeSpentMs: 2 }));
        runResult.tests.push(factory.successTestResult({ timeSpentMs: 6 }));
        const expectedOverHeadTimeMs = 82;
        timerMock.elapsedMs.returns(100);

        // Act
        const actualResultInjector = await sut.execute();

        // Assert
        expect(timerMock.mark).calledWith('Initial test run');
        expect(timerMock.elapsedMs).calledWith('Initial test run');
        expect(timerMock.mark).calledBefore(timerMock.elapsedMs);
        expect(actualResultInjector.provideValue).calledWithExactly(coreTokens.timeOverheadMS, expectedOverHeadTimeMs);
      });

      it('should never calculate a negative overhead time', async () => {
        runResult.tests.push(factory.successTestResult({ timeSpentMs: 10 }));
        timerMock.elapsedMs.returns(9);
        const injector = await sut.execute();
        expect(injector.provideValue).calledWithExactly(coreTokens.timeOverheadMS, 0);
      });

      it('should provide the result', async () => {
        timerMock.elapsedMs.returns(42);
        runResult.tests.push(factory.successTestResult());
        runResult.mutantCoverage = {
          perTest: {},
          static: {},
        };
        const actualInjector = await sut.execute();
        expect(actualInjector.provideValue).calledWithExactly(coreTokens.dryRunResult, runResult);
      });

      it('should have logged the amount of tests ran', async () => {
        runResult.tests.push(factory.successTestResult({ timeSpentMs: 10 }));
        runResult.tests.push(factory.successTestResult({ timeSpentMs: 10 }));
        timerMock.humanReadableElapsed.returns('2 seconds');
        timerMock.elapsedMs.returns(50);
        await sut.execute();
        expect(testInjector.logger.info).to.have.been.calledWith(
          'Initial test run succeeded. Ran %s tests in %s (net %s ms, overhead %s ms).',
          2,
          '2 seconds',
          20,
          30
        );
      });

      it('should log when there were no tests', async () => {
        await sut.execute();
        expect(testInjector.logger.warn).to.have.been.calledWith(
          'No tests were executed. Stryker will exit prematurely. Please check your configuration.'
        );
      });
    });
    describe('with failed tests', () => {
      beforeEach(() => {
        runResult.tests.push(factory.failedTestResult({ name: 'foo is bar', failureMessage: 'foo was baz' }));
        runResult.tests.push(factory.failedTestResult({ name: 'bar is baz', failureMessage: 'bar was qux' }));
      });

      it('should have logged the errors', async () => {
        await expect(sut.execute()).rejected;
        expect(testInjector.logger.error).calledWith(
          `One or more tests failed in the initial test run:${EOL}\tfoo is bar${EOL}\t\tfoo was baz${EOL}\tbar is baz${EOL}\t\tbar was qux`
        );
      });

      it('should reject with correct message', async () => {
        await expect(sut.execute()).rejectedWith(ConfigError, 'There were failed tests in the initial test run.');
      });
    });
  });

  describe('when dryRun errors', () => {
    let runResult: ErrorDryRunResult;

    beforeEach(() => {
      runResult = factory.errorDryRunResult();
      testRunnerMock.dryRun.resolves(runResult);
    });

    it('should have logged the errors', async () => {
      runResult.errorMessage = 'cannot call foo() on undefined';
      await expect(sut.execute()).rejected;
      expect(testInjector.logger.error).calledWith(`One or more tests resulted in an error:${EOL}\tcannot call foo() on undefined`);
    });
    it('should reject with correct message', async () => {
      await expect(sut.execute()).rejectedWith('Something went wrong in the initial test run');
    });
  });

  describe('when dryRun timedOut', () => {
    let runResult: TimeoutDryRunResult;

    beforeEach(() => {
      runResult = factory.timeoutDryRunResult();
      testRunnerMock.dryRun.resolves(runResult);
    });

    it('should have logged the timeout', async () => {
      await expect(sut.execute()).rejected;
      expect(testInjector.logger.error).calledWith('Initial test run timed out!');
    });

    it('should reject with correct message', async () => {
      await expect(sut.execute()).rejectedWith('Something went wrong in the initial test run');
    });
  });
});
