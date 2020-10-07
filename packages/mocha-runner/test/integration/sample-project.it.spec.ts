import * as path from 'path';

import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import { TestResult, CompleteDryRunResult, TestStatus } from '@stryker-mutator/api/test-runner';
import { expect } from 'chai';

import { createMochaOptions } from '../helpers/factories';
import { createMochaTestRunnerFactory, MochaTestRunner } from '../../src';

const countTests = (runResult: CompleteDryRunResult, predicate: (result: TestResult) => boolean) => runResult.tests.filter(predicate).length;

const countSucceeded = (runResult: CompleteDryRunResult) => countTests(runResult, (t) => t.status === TestStatus.Success);
const countFailed = (runResult: CompleteDryRunResult) => countTests(runResult, (t) => t.status === TestStatus.Failed);

function resolve(fileName: string) {
  return path.resolve(__dirname, '..', '..', fileName);
}

describe('Running a sample project', () => {
  let sut: MochaTestRunner;
  let spec: string[];

  function createSut() {
    return testInjector.injector.injectFunction(createMochaTestRunnerFactory('__stryker2__'));
  }

  describe('when tests pass', () => {
    beforeEach(() => {
      spec = [resolve('./testResources/sample-project/MyMath.js'), resolve('./testResources/sample-project/MyMathSpec.js')];
      testInjector.options.mochaOptions = createMochaOptions({ spec });
      sut = createSut();
      return sut.init();
    });

    it('should report completed tests', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(countSucceeded(runResult)).to.be.eq(5, 'Succeeded tests did not match');
      expect(countFailed(runResult)).to.be.eq(0, 'Failed tests did not match');
      runResult.tests.forEach((t) => expect(t.timeSpentMs).to.be.greaterThan(-1).and.to.be.lessThan(1000));
    });

    it('should be able to run 2 times in a row', async () => {
      await sut.dryRun(factory.dryRunOptions());
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(countSucceeded(runResult)).to.be.eq(5);
    });
  });

  describe('with an error in an un-included input file', () => {
    beforeEach(() => {
      spec = [resolve('testResources/sample-project/MyMath.js'), resolve('testResources/sample-project/MyMathSpec.js')];
      testInjector.options.mochaOptions = createMochaOptions({
        files: spec,
      });
      sut = createSut();
      return sut.init();
    });

    it('should report completed tests without errors', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
    });
  });

  describe('with multiple failed tests', () => {
    before(() => {
      spec = [resolve('testResources/sample-project/MyMath.js'), resolve('testResources/sample-project/MyMathFailedSpec.js')];
      testInjector.options.mochaOptions = createMochaOptions({ spec });
      sut = createSut();
      return sut.init();
    });

    it('should only report the first failure', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(countFailed(runResult)).to.be.eq(1);
    });
  });

  describe('when no tests are executed', () => {
    beforeEach(() => {
      spec = [resolve('./testResources/sample-project/MyMath.js')];
      testInjector.options.mochaOptions = createMochaOptions({ spec });
      sut = createSut();
      return sut.init();
    });

    it('should report no completed tests', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(countSucceeded(runResult)).to.be.eq(0, 'Succeeded tests did not match');
      expect(countFailed(runResult)).to.be.eq(0, 'Failed tests did not match');
      runResult.tests.forEach((t) => expect(t.timeSpentMs).to.be.greaterThan(-1).and.to.be.lessThan(1000));
    });
  });
});
