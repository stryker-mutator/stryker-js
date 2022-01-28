import { FailedTestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import { assertions, factory, fsPromisesCp, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createMochaTestRunnerFactory, MochaTestRunner } from '../../src';
import { MochaRunnerWithStrykerOptions } from '../../src/mocha-runner-with-stryker-options';
import { resolveTempTestResourceDirectory, resolveTestResource } from '../helpers/resolve-test-resource';

describe('regression integration tests', () => {
  let options: MochaRunnerWithStrykerOptions;
  let sut: MochaTestRunner;

  beforeEach(() => {
    options = testInjector.options as MochaRunnerWithStrykerOptions;
    options.mochaOptions = { 'no-config': true };
  });

  afterEach(async () => {
    await sut.dispose();
  });

  describe('issue #2720', () => {
    beforeEach(async () => {
      const tmpDir = resolveTempTestResourceDirectory();
      await fsPromisesCp(resolveTestResource('regression', 'issue-2720'), tmpDir, { recursive: true });
      process.chdir(tmpDir);
    });

    it('should have report correct failing test when "beforeEach" fails', async () => {
      // Arrange
      options.mochaOptions.spec = ['failing-before-each'];
      sut = testInjector.injector.injectFunction(createMochaTestRunnerFactory('__stryker2__'));
      await sut.init();

      // Act
      const result = await sut.dryRun(factory.dryRunOptions({}));

      // Assert
      assertions.expectCompleted(result);
      const expected: Partial<FailedTestResult> = {
        name: 'suite should fail in beforeEach',
        id: 'suite should fail in beforeEach',
        status: TestStatus.Failed,
      };
      expect(result.tests).lengthOf(1);
      expect(result.tests[0]).deep.contains(expected);
    });

    it('should have report correct failing test when "afterEach" fails', async () => {
      // Arrange
      options.mochaOptions.spec = ['failing-after-each'];
      sut = testInjector.injector.injectFunction(createMochaTestRunnerFactory('__stryker2__'));
      await sut.init();

      // Act
      const result = await sut.dryRun(factory.dryRunOptions({}));

      // Assert
      assertions.expectCompleted(result);
      const expected: Partial<FailedTestResult> = {
        name: 'suite2 should fail in afterEach',
        id: 'suite2 should fail in afterEach',
        status: TestStatus.Failed,
      };
      expect(result.tests).lengthOf(2);
      expect(result.tests[1]).deep.contains(expected);
    });
  });
});
