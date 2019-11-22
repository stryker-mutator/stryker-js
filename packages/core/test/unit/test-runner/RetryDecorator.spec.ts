import { Logger } from '@stryker-mutator/api/logging';
import { RunStatus } from '@stryker-mutator/api/test_runner';
import { errorToString } from '@stryker-mutator/util';
import { expect } from 'chai';

import ChildProcessCrashedError from '../../../src/child-proxy/ChildProcessCrashedError';
import OutOfMemoryError from '../../../src/child-proxy/OutOfMemoryError';
import RetryDecorator from '../../../src/test-runner/RetryDecorator';
import TestRunnerDecorator from '../../../src/test-runner/TestRunnerDecorator';
import currentLogMock from '../../helpers/logMock';
import { Mock } from '../../helpers/producers';
import TestRunnerMock from '../../helpers/TestRunnerMock';

describe('RetryDecorator', () => {
  let sut: RetryDecorator;
  let testRunner1: TestRunnerMock;
  let testRunner2: TestRunnerMock;
  let availableTestRunners: TestRunnerMock[];
  let logMock: Mock<Logger>;
  const options = { timeout: 2 };
  const expectedResult = 'something';
  const crashedError = new ChildProcessCrashedError(42, '');

  beforeEach(() => {
    testRunner1 = new TestRunnerMock();
    testRunner2 = new TestRunnerMock();
    logMock = currentLogMock();
    availableTestRunners = [testRunner1, testRunner2];
    sut = new RetryDecorator(() => availableTestRunners.shift() || new TestRunnerMock());
  });

  it('should not override `init`', () => {
    expect(sut.init).to.be.eq(TestRunnerDecorator.prototype.init);
  });

  it('should not override `dispose`', () => {
    expect(sut.dispose).to.be.eq(TestRunnerDecorator.prototype.dispose);
  });

  describe('run', () => {
    it('should pass through resolved values', () => {
      testRunner1.run.resolves(expectedResult);
      const result = sut.run(options);
      expect(testRunner1.run).to.have.been.calledWith(options);
      return expect(result).to.eventually.eq(expectedResult);
    });

    it('should retry on a new test runner if a run is rejected', () => {
      testRunner1.run.rejects(new Error('Error'));
      testRunner2.run.resolves(expectedResult);
      return expect(sut.run(options)).to.eventually.eq(expectedResult);
    });

    it('should retry if a `ChildProcessCrashedError` occurred reject appears', () => {
      testRunner1.run.rejects(crashedError);
      testRunner2.run.resolves(expectedResult);
      return expect(sut.run(options)).to.eventually.eq(expectedResult);
    });

    it('should log and retry when an `OutOfMemoryError` occurred.', async () => {
      testRunner1.run.rejects(new OutOfMemoryError(123, 123));
      testRunner2.run.resolves(expectedResult);
      await expect(sut.run(options)).to.eventually.eq(expectedResult);
      expect(logMock.info).calledWith(
        "Test runner process [%s] ran out of memory. You probably have a memory leak in your tests. Don't worry, Stryker will restart the process, but you might want to investigate this later, because this decreases performance.",
        123
      );
    });

    it('should dispose a test runner when it rejected, before creating a new one', async () => {
      testRunner1.run.rejects(crashedError);
      testRunner2.run.resolves(expectedResult);
      await sut.run(options);
      expect(testRunner1.dispose).calledBefore(testRunner2.init);
    });

    it('should retry at most 1 times before rejecting', async () => {
      const finalError = new Error('foo');

      testRunner1.run.rejects(new Error('bar'));
      testRunner2.run.rejects(finalError);

      const runResult = await sut.run(options);
      expect(runResult.status).to.be.eq(RunStatus.Error);
      expect(runResult.errorMessages).to.be.deep.eq([
        `Test runner crashed. Tried twice to restart it without any luck. Last time the error message was: ${errorToString(finalError)}`
      ]);
      expect(availableTestRunners).to.have.lengthOf(0);
    });
  });
});
