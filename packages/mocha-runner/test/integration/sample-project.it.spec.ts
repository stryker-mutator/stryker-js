import path from 'path';

import { testInjector, factory, assertions, TempTestDirectorySandbox } from '@stryker-mutator/test-helpers';
import { TestResult, CompleteDryRunResult, TestStatus } from '@stryker-mutator/api/test-runner';
import { expect } from 'chai';

import { createMochaOptions } from '../helpers/factories.js';
import { createMochaTestRunnerFactory, MochaTestRunner } from '../../src/index.js';

const countTests = (runResult: CompleteDryRunResult, predicate: (result: TestResult) => boolean) => runResult.tests.filter(predicate).length;

const countSucceeded = (runResult: CompleteDryRunResult) => countTests(runResult, (t) => t.status === TestStatus.Success);
const countFailed = (runResult: CompleteDryRunResult) => countTests(runResult, (t) => t.status === TestStatus.Failed);

describe('Running a sample project', () => {
  let sut: MochaTestRunner;
  let resolveTestFile: (...pathSegments: string[]) => string;
  let sandbox: TempTestDirectorySandbox;

  function createSut() {
    return testInjector.injector.injectFunction(createMochaTestRunnerFactory('__stryker2__'));
  }

  beforeEach(async () => {
    // Work in a tmp dir, files can only be loaded once.
    sandbox = new TempTestDirectorySandbox('sample-project');
    await sandbox.init();
    resolveTestFile = path.resolve.bind(undefined, sandbox.tmpDir);
  });

  afterEach(async () => {
    if (sut) {
      await sut.dispose();
    }
    await sandbox.dispose();
  });

  describe('when tests pass', () => {
    beforeEach(async () => {
      const spec = [resolveTestFile('MyMathSpec.js')];
      testInjector.options.mochaOptions = createMochaOptions({ spec });
      sut = createSut();
      await sut.init();
    });

    it('should report completed tests', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(countSucceeded(runResult)).to.be.eq(5, 'Succeeded tests did not match');
      expect(countFailed(runResult)).to.be.eq(0, 'Failed tests did not match');
      runResult.tests.forEach((t) => expect(t.timeSpentMs).to.be.greaterThan(-1).and.to.be.lessThan(1000));
    });

    it('should report test files', async () => {
      const specFileName = resolveTestFile('MyMathSpec.js');
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(runResult.tests[0].fileName).eq(specFileName);
      expect(runResult.tests[1].fileName).eq(specFileName);
      expect(runResult.tests[2].fileName).eq(specFileName);
      expect(runResult.tests[3].fileName).eq(specFileName);
      expect(runResult.tests[4].fileName).eq(specFileName);
    });

    it('should be able to run 2 times in a row', async () => {
      await sut.dryRun(factory.dryRunOptions());
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(countSucceeded(runResult)).to.be.eq(5);
    });
  });

  describe('with multiple failed tests', () => {
    beforeEach(() => {
      const spec = [resolveTestFile('MyMathFailedSpec.js')];
      testInjector.options.mochaOptions = createMochaOptions({ spec });
      sut = createSut();
      return sut.init();
    });

    it('should only report the first failure (bail)', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(countFailed(runResult)).to.be.eq(1);
    });

    it('should report all failures with disableBail = true', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions({ disableBail: true }));
      assertions.expectCompleted(runResult);
      expect(countFailed(runResult)).to.be.eq(2);
    });
  });

  describe('when no tests are executed', () => {
    beforeEach(() => {
      const spec = [resolveTestFile('MyMath.js')];
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
