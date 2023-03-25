import path from 'path';

import { FailedTestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import { assertions, factory, TempTestDirectorySandbox, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createMochaTestRunnerFactory, MochaTestRunner } from '../../src/index.js';
import { MochaRunnerWithStrykerOptions } from '../../src/mocha-runner-with-stryker-options.js';

describe('regression integration tests', () => {
  let options: MochaRunnerWithStrykerOptions;
  let sut: MochaTestRunner;
  let sandbox: TempTestDirectorySandbox;

  beforeEach(() => {
    options = testInjector.options as MochaRunnerWithStrykerOptions;
    options.mochaOptions = { 'no-config': true };
  });

  afterEach(async () => {
    await sut.dispose();
    await sandbox.dispose();
  });

  describe('issue #2720', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox(path.join('regression', 'issue-2720'));
      await sandbox.init();
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
