import { TestStatus } from '@stryker-mutator/api/test-runner';
import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createJasmineTestRunnerFactory, JasmineTestRunner } from '../../src/jasmine-test-runner';
import { expectTestResultsToEqual } from '../helpers/assertions';
import { resolveFromRoot, resolveTestResource } from '../helpers/resolve-test-resource';

import { jasmineInitSuccessResults } from './helpers';

describe('JasmineRunner integration', () => {
  let sut: JasmineTestRunner;

  afterEach(async () => {
    process.chdir(resolveFromRoot());
    await sut.dispose();
  });

  describe('using the jasmine-init project', () => {
    beforeEach(() => {
      process.chdir(resolveTestResource('jasmine-init'));
      testInjector.options.jasmineConfigFile = 'spec/support/jasmine.json';
      sut = testInjector.injector.injectFunction(createJasmineTestRunnerFactory('__stryker2__'));
    });

    it('should run the specs', async () => {
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expectTestResultsToEqual(runResult.tests, jasmineInitSuccessResults);
    });

    it('should be able to run twice in short succession', async () => {
      await sut.dryRun(factory.dryRunOptions());
      const secondRunResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(secondRunResult);
      expectTestResultsToEqual(secondRunResult.tests, jasmineInitSuccessResults);
    });

    it('should be able to filter tests', async () => {
      // Arrange
      const jasmineInitResults = jasmineInitSuccessResults;
      const testFilter = [jasmineInitResults[1].id, jasmineInitResults[3].id];

      // Act
      const runResult = await sut.mutantRun(factory.mutantRunOptions({ testFilter }));

      // Assert
      assertions.expectSurvived(runResult);
      expect(global.__testsInCurrentJasmineRun).deep.eq(['spec1', 'spec3']);
    });

    it('should be able to clear the filter after a filtered run', async () => {
      // Arrange
      const jasmineInitResults = jasmineInitSuccessResults;
      const filter1Test = [jasmineInitResults[1].id];
      const filterNoTests = undefined;

      // Act
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: filter1Test }));
      global.__testsInCurrentJasmineRun = [];
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: filterNoTests }));

      // Assert
      expect(global.__testsInCurrentJasmineRun).deep.eq(['spec0', 'spec1', 'spec2', 'spec3', 'spec4']);
    });

    it('should be able to filter tests in quick succession', async () => {
      // Arrange
      const testHooks1 = [jasmineInitSuccessResults[1].id];
      const testHooks2 = [jasmineInitSuccessResults[2].id];

      // Act
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: testHooks1 }));
      const testsRunFirstTime = global.__testsInCurrentJasmineRun;
      global.__testsInCurrentJasmineRun = [];
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: testHooks2 }));
      const testsRunSecondTime = global.__testsInCurrentJasmineRun;

      // Assert
      expect(testsRunFirstTime).deep.eq(['spec1']);
      expect(testsRunSecondTime).deep.eq(['spec2']);
    });
  });

  describe('using a jasmine-project with errors', () => {
    beforeEach(async () => {
      process.chdir(resolveTestResource('errors'));
      sut = testInjector.injector.injectFunction(createJasmineTestRunnerFactory('__stryker2__'));
    });

    it('should be able to tell the error', async () => {
      const result = await sut.dryRun(factory.dryRunOptions());
      assertions.expectErrored(result);
      expect(result.errorMessage)
        .matches(/^An error occurred while loading your jasmine specs.*/)
        .matches(/.*SyntaxError: Unexpected identifier.*/);
    });
  });

  describe('when it includes failed tests', () => {
    beforeEach(() => {
      process.chdir(resolveTestResource('test-failures'));
      sut = testInjector.injector.injectFunction(createJasmineTestRunnerFactory('__stryker2__'));
    });

    it('should complete with one test failure', async () => {
      const result = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(result);
      expectTestResultsToEqual(result.tests, [
        {
          id: 'spec0',
          status: TestStatus.Failed,
          failureMessage: "Expected 'bar' to be 'baz'.",
          name: 'foo should be baz',
        },
      ]);
    });
  });
});
