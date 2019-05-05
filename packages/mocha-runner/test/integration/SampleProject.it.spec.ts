import * as chai from 'chai';
import MochaTestRunner from '../../src/MochaTestRunner';
import { TestResult, RunResult, TestStatus, RunStatus } from '@stryker-mutator/api/test_runner';
import * as chaiAsPromised from 'chai-as-promised';
import * as path from 'path';
import { testInjector } from '@stryker-mutator/test-helpers';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { MochaOptions } from '../../src/MochaOptions';
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

describe('Running a sample project', () => {

  let sut: MochaTestRunner;
  let spec: string[];

  function createSut() {
    return testInjector.injector
      .provideValue(commonTokens.sandboxFileNames, spec)
      .injectClass(MochaTestRunner);
  }

  describe('when tests pass', () => {

    beforeEach(() => {
      spec = [
        resolve('./testResources/sampleProject/MyMath.js'),
        resolve('./testResources/sampleProject/MyMathSpec.js')
      ];
      testInjector.options.mochaOptions = { spec };
      sut = createSut();
      return sut.init();
    });

    it('should report completed tests', async () => {
      const runResult = await sut.run({});
      expect(countSucceeded(runResult)).to.be.eq(5, 'Succeeded tests did not match');
      expect(countFailed(runResult)).to.be.eq(0, 'Failed tests did not match');
      runResult.tests.forEach(t => expect(t.timeSpentMs).to.be.greaterThan(-1).and.to.be.lessThan(1000));
      expect(runResult.status).to.be.eq(RunStatus.Complete, 'Test result did not match');
      expect(runResult.coverage).to.not.be.ok;
    });

    it('should be able to run 2 times in a row', async () => {
      await sut.run({});
      const runResult = await sut.run({});
      expect(countSucceeded(runResult)).to.be.eq(5);
    });
  });

  describe('with an error in an un-included input file', () => {
    beforeEach(() => {
      spec = [
        resolve('testResources/sampleProject/MyMath.js'),
        resolve('testResources/sampleProject/MyMathSpec.js'),
      ];
      const mochaOptions: MochaOptions = {
        files: spec
      };
      testInjector.options.mochaOptions = mochaOptions;
      sut = createSut();
      return sut.init();
    });

    it('should report completed tests without errors', async () => {
      const runResult = await sut.run({});
      expect(runResult.status).to.be.eq(RunStatus.Complete, 'Test result did not match');
    });
  });

  describe('with multiple failed tests', () => {

    before(() => {
      spec = [
        resolve('testResources/sampleProject/MyMath.js'),
        resolve('testResources/sampleProject/MyMathFailedSpec.js')
      ];
      testInjector.options.mochaOptions = { spec };
      sut = createSut();
      return sut.init();
    });

    it('should only report the first failure', async () => {
      const runResult = await sut.run({});
      expect(countFailed(runResult)).to.be.eq(1);
    });
  });

  describe('when no tests are executed', () => {

    beforeEach(() => {
      spec = [resolve('./testResources/sampleProject/MyMath.js')];
      testInjector.options.mochaOptions = { spec };
      sut = createSut();
      return sut.init();
    });

    it('should report no completed tests', async () => {
      const runResult = await sut.run({});
      expect(countSucceeded(runResult)).to.be.eq(0, 'Succeeded tests did not match');
      expect(countFailed(runResult)).to.be.eq(0, 'Failed tests did not match');
      runResult.tests.forEach(t => expect(t.timeSpentMs).to.be.greaterThan(-1).and.to.be.lessThan(1000));
      expect(runResult.status).to.be.eq(RunStatus.Complete, 'Test result did not match');
      expect(runResult.coverage).to.not.be.ok;
    });
  });
});
