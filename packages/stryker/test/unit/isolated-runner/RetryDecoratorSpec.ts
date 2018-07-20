import { expect } from 'chai';
import { RunResult, RunStatus } from 'stryker-api/test_runner';
import RetryDecorator from '../../../src/isolated-runner/RetryDecorator';
import TestRunnerMock from '../../helpers/TestRunnerMock';
import { errorToString } from '../../../src/utils/objectUtils';
import TestRunnerDecorator from '../../../src/isolated-runner/TestRunnerDecorator';

describe('RetryDecorator', () => {
  let sut: RetryDecorator;
  let testRunner1: TestRunnerMock;
  let testRunner2: TestRunnerMock;
  let testRunner3: TestRunnerMock;
  let testRunner4: TestRunnerMock;
  let availableTestRunners: TestRunnerMock[];
  const options = { timeout: 2 };
  const expectedResult = 'something';
  const brokenPipeError: NodeJS.ErrnoException = {
    name: '',
    code: 'EPIPE',
    message: 'Intended error for testing'
  };

  beforeEach(() => {
    testRunner1 = new TestRunnerMock();
    testRunner2 = new TestRunnerMock();
    testRunner3 = new TestRunnerMock();
    testRunner4 = new TestRunnerMock();
    availableTestRunners = [testRunner1, testRunner2, testRunner3, testRunner4];
    sut = new RetryDecorator(() => <any>availableTestRunners.shift());
  });

  describe('init', () => {
    it('should not be overridden', () => {
      expect(sut.init).to.be.eq(TestRunnerDecorator.prototype.init);
    });
  });

  describe('dispose', () => {
    it('should pass through when resolved', () => {
      testRunner1.dispose.resolves(null);
      return expect(sut.dispose()).to.eventually.eq(null);
    });

    it('should swallow rejections when inner process crashed', () => {
      testRunner1.dispose.rejects(brokenPipeError);
      return expect(sut.dispose()).to.eventually.not.be.ok;
    });

    it('should pass through non-crash related rejections', () => {
      testRunner1.dispose.rejects(new Error('someError'));
      return expect(sut.dispose()).to.be.rejectedWith('someError');
    });
  });

  describe('run', () => {
    it('should pass through resolved values', () => {
      testRunner1.run.resolves(expectedResult);
      const result = sut.run(options);
      expect(testRunner1.run).to.have.been.calledWith(options);
      return expect(result).to.eventually.eq(expectedResult);
    });

    it('should retry on a new test runner if a reject appears', () => {
      testRunner1.run.rejects(new Error('Error'));
      testRunner2.run.resolves(expectedResult);
      return expect(sut.run(options)).to.eventually.eq(expectedResult);
    });

    it('should retry at most 1 times before rejecting', () => {
      const finalError = new Error('Error');

      testRunner1.run.rejects(new Error('Error'));
      testRunner2.run.rejects(finalError);

      return sut.run(options).then((runResult: RunResult) => {
        expect(runResult.status).to.be.eq(RunStatus.Error);
        expect(runResult.errorMessages).to.be.deep.eq(['Test runner crashed. Tried twice to restart it without any luck. Last time the error message was: '
        + errorToString(finalError)]);
        expect(availableTestRunners).to.have.lengthOf(0);
      });
    });
  });
});