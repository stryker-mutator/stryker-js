import { FailedTestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createMochaTestRunnerFactory } from '../../src';
import { MochaRunnerWithStrykerOptions } from '../../src/mocha-runner-with-stryker-options';
import { resolveTestResource } from '../helpers/resolve-test-resource';

describe('regression integration tests', () => {
  let options: MochaRunnerWithStrykerOptions;

  beforeEach(() => {
    options = testInjector.options as MochaRunnerWithStrykerOptions;
    options.mochaOptions = { 'no-config': true };
  });

  describe('issue #2720', () => {
    beforeEach(async () => {
      process.chdir(resolveTestResource('regression', 'issue-2720'));
    });

    it('should have report correct failing test when "beforeEach" fails', async () => {
      // Arrange
      options.mochaOptions.spec = ['failing-before-each'];
      const sut = testInjector.injector.injectFunction(createMochaTestRunnerFactory('__stryker2__'));
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
      const sut = testInjector.injector.injectFunction(createMochaTestRunnerFactory('__stryker2__'));
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
      expect(result.tests).lengthOf(1);
      expect(result.tests[0]).deep.contains(expected);
    });
  });
});
