import * as chai from 'chai';
import MochaTestRunner from '../../src/MochaTestRunner';
import { TestResult, RunResult, TestStatus, RunStatus } from 'stryker-api/test_runner';
import * as chaiAsPromised from 'chai-as-promised';
import * as path from 'path';
import { fileDescriptor } from '../helpers/mockHelpers';
chai.use(chaiAsPromised);
const expect = chai.expect;

const countTests = (runResult: RunResult, predicate: (result: TestResult) => boolean) =>
  runResult.tests.filter(predicate).length;

const countSucceeded = (runResult: RunResult) =>
  countTests(runResult, t => t.status === TestStatus.Success);
const countFailed = (runResult: RunResult) =>
  countTests(runResult, t => t.status === TestStatus.Failed);

function resolve(fileName: string) {
  return path.resolve(__dirname, '..', '..', fileName);
}

describe('Running a sample project', function () {

  let sut: MochaTestRunner;
  this.timeout(10000);

  describe('when tests pass', () => {

    beforeEach(() => {
      const testRunnerOptions = {
        files: [
          fileDescriptor({ name: resolve('./testResources/sampleProject/src/MyMath.js') }),
          fileDescriptor({ name: resolve('./testResources/sampleProject/test/MyMathSpec.js') })],
        strykerOptions: {},
        port: 1234
      };
      sut = new MochaTestRunner(testRunnerOptions);
    });

    it('should report completed tests', () =>
      expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
        expect(countSucceeded(runResult)).to.be.eq(5, 'Succeeded tests did not match');
        expect(countFailed(runResult)).to.be.eq(0, 'Failed tests did not match');
        runResult.tests.forEach(t => expect(t.timeSpentMs).to.be.greaterThan(-1).and.to.be.lessThan(1000));
        expect(runResult.status).to.be.eq(RunStatus.Complete, 'Test result did not match');
        expect(runResult.coverage).to.not.be.ok;
        return true;
      }));

    it('should be able to run 2 times in a row', () => {
      return expect(sut.run().then(() => sut.run())).to.eventually.satisfy((runResult: RunResult) => {
        expect(countSucceeded(runResult)).to.be.eq(5);
        return true;
      });
    });
  });

  describe('with an error in an un-included input file', () => {
    beforeEach(() => {
      let options = {
        files: [
          fileDescriptor({ name: resolve('testResources/sampleProject/src/MyMath.js') }),
          fileDescriptor({ name: resolve('testResources/sampleProject/src/Error.js'), included: false }),
          fileDescriptor({ name: resolve('testResources/sampleProject/test/MyMathSpec.js') })],
        strykerOptions: {},
        port: 1234
      };
      sut = new MochaTestRunner(options);
    });

    it('should report completed tests without errors', () => expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
      expect(runResult.status).to.be.eq(RunStatus.Complete, 'Test result did not match');
      return true;
    }));
  });

  describe('with multiple failed tests', () => {

    before(() => {
      sut = new MochaTestRunner({
        files: [
          fileDescriptor({ name: resolve('testResources/sampleProject/src/MyMath.js') }),
          fileDescriptor({ name: resolve('testResources/sampleProject/test/MyMathFailedSpec.js') })],
        strykerOptions: {},
        port: 1234
      });
    });

    it('should only report the first failure', () => expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
      expect(countFailed(runResult)).to.be.eq(1);
      return true;
    }));
  });

  describe('when no tests are executed', () => {

    beforeEach(() => {
      const testRunnerOptions = {
        files: [
          fileDescriptor({ name: resolve('./testResources/sampleProject/src/MyMath.js') })],
        strykerOptions: {},
        port: 1234
      };
      sut = new MochaTestRunner(testRunnerOptions);
    });

    it('should report no completed tests', () =>
      expect(sut.run()).to.eventually.satisfy((runResult: RunResult) => {
        expect(countSucceeded(runResult)).to.be.eq(0, 'Succeeded tests did not match');
        expect(countFailed(runResult)).to.be.eq(0, 'Failed tests did not match');
        runResult.tests.forEach(t => expect(t.timeSpentMs).to.be.greaterThan(-1).and.to.be.lessThan(1000));
        expect(runResult.status).to.be.eq(RunStatus.Complete, 'Test result did not match');
        expect(runResult.coverage).to.not.be.ok;
        return true;
      }));
  });
});