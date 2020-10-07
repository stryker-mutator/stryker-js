import { Logger } from '@stryker-mutator/api/logging';
import { errorToString } from '@stryker-mutator/util';
import { TestRunner, DryRunOptions, MutantRunOptions, DryRunResult, MutantRunResult } from '@stryker-mutator/api/test-runner';
import { expect } from 'chai';

import { factory } from '@stryker-mutator/test-helpers';

import { expectErrored } from '@stryker-mutator/test-helpers/src/assertions';

import ChildProcessCrashedError from '../../../src/child-proxy/child-process-crashed-error';
import OutOfMemoryError from '../../../src/child-proxy/out-of-memory-error';
import RetryDecorator from '../../../src/test-runner/retry-decorator';
import TestRunnerDecorator from '../../../src/test-runner/test-runner-decorator';
import currentLogMock from '../../helpers/log-mock';

describe(RetryDecorator.name, () => {
  let sut: RetryDecorator;
  let testRunner1: sinon.SinonStubbedInstance<Required<TestRunner>>;
  let testRunner2: sinon.SinonStubbedInstance<Required<TestRunner>>;
  let availableTestRunners: Array<sinon.SinonStubbedInstance<Required<TestRunner>>>;
  let logMock: sinon.SinonStubbedInstance<Logger>;
  const crashedError = new ChildProcessCrashedError(42, '');

  beforeEach(() => {
    testRunner1 = factory.testRunner();
    testRunner2 = factory.testRunner();
    logMock = currentLogMock();
    availableTestRunners = [testRunner1, testRunner2];
    sut = new RetryDecorator(() => availableTestRunners.shift() || factory.testRunner());
  });

  it('should not override `init`', () => {
    expect(sut.init).to.be.eq(TestRunnerDecorator.prototype.init);
  });

  it('should not override `dispose`', () => {
    expect(sut.dispose).to.be.eq(TestRunnerDecorator.prototype.dispose);
  });

  describeRun(
    'dryRun',
    (sut, options) => sut.dryRun(options),
    () => factory.dryRunOptions({ timeout: 23 }),
    () => factory.completeDryRunResult()
  );
  describeRun(
    'mutantRun',
    (sut, options) => sut.mutantRun(options),
    () => factory.mutantRunOptions({ timeout: 23 }),
    () => factory.survivedMutantRunResult()
  );

  interface RunOptionsByMethod {
    dryRun: DryRunOptions;
    mutantRun: MutantRunOptions;
  }
  interface RunResultByMethod {
    dryRun: DryRunResult;
    mutantRun: MutantRunResult;
  }

  function describeRun<T extends keyof RunOptionsByMethod>(
    runMethod: T,
    act: (sut: RetryDecorator, options: RunOptionsByMethod[T]) => Promise<RunResultByMethod[T]>,
    optionsFactory: () => RunOptionsByMethod[T],
    resultFactory: () => RunResultByMethod[T]
  ) {
    describe(runMethod, () => {
      let options: RunOptionsByMethod[T];
      let expectedRunResult: RunResultByMethod[T];

      beforeEach(() => {
        options = optionsFactory();
        expectedRunResult = resultFactory();
      });

      it('should pass through resolved values', async () => {
        const expectedResult = factory.completeDryRunResult();
        testRunner1[runMethod].resolves(expectedResult);
        const result = await act(sut, options);
        expect(testRunner1[runMethod]).to.have.been.calledWith(options);
        expect(result).to.eq(expectedResult);
      });

      it('should retry on a new test runner if a run is rejected', async () => {
        testRunner1[runMethod].rejects(new Error('Error'));
        testRunner2[runMethod].resolves(expectedRunResult);
        const result = await act(sut, options);
        expect(result).to.eq(expectedRunResult);
      });

      it('should retry if a `ChildProcessCrashedError` occurred reject appears', async () => {
        testRunner1[runMethod].rejects(crashedError);
        testRunner2[runMethod].resolves(expectedRunResult);
        const result = await act(sut, options);
        expect(result).to.eq(expectedRunResult);
      });

      it('should log and retry when an `OutOfMemoryError` occurred.', async () => {
        testRunner1[runMethod].rejects(new OutOfMemoryError(123, 123));
        testRunner2[runMethod].resolves(expectedRunResult);
        const result = await act(sut, options);
        expect(result).to.eq(expectedRunResult);
        expect(logMock.info).calledWith(
          "Test runner process [%s] ran out of memory. You probably have a memory leak in your tests. Don't worry, Stryker will restart the process, but you might want to investigate this later, because this decreases performance.",
          123
        );
      });

      it('should dispose a test runner when it rejected, before creating a new one', async () => {
        testRunner1[runMethod].rejects(crashedError);
        testRunner2[runMethod].resolves(expectedRunResult);
        await act(sut, options);
        expect(testRunner1.dispose).calledBefore(testRunner2.init);
      });

      it('should retry at most 1 times before rejecting', async () => {
        const finalError = new Error('foo');

        testRunner1[runMethod].rejects(new Error('bar'));
        testRunner2[runMethod].rejects(finalError);

        const result = await act(sut, options);
        expectErrored(result);
        expect((result as any).errorMessage).to.be.deep.eq(
          `Test runner crashed. Tried twice to restart it without any luck. Last time the error message was: ${errorToString(finalError)}`
        );
        expect(availableTestRunners).to.have.lengthOf(0);
      });
    });
  }
});
