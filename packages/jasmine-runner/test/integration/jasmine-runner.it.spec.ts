import fs from 'fs';

import { factory, assertions, testInjector, fsPromisesCp } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { TestStatus } from '@stryker-mutator/api/test-runner';

import { JasmineTestRunner, createJasmineTestRunnerFactory } from '../../src/jasmine-test-runner';
import { expectTestResultsToEqual } from '../helpers/assertions';
import { resolveFromRoot, resolveTempTestResourceDirectory, resolveTestResource } from '../helpers/resolve-test-resource';

import { jasmineInitSuccessResults } from './helpers';

describe('JasmineRunner integration', () => {
  let sut: JasmineTestRunner;
  let tmpDir: string;

  afterEach(async () => {
    process.chdir(resolveFromRoot());
    await fs.promises.rm(tmpDir, { recursive: true });
  });

  describe('using the jasmine-init project', () => {
    beforeEach(async () => {
      tmpDir = resolveTempTestResourceDirectory();
      await fsPromisesCp(resolveTestResource('jasmine-init'), tmpDir, { recursive: true });
      process.chdir(tmpDir);
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
  });

  describe('using a jasmine-project with errors', () => {
    beforeEach(async () => {
      tmpDir = resolveTempTestResourceDirectory();
      await fsPromisesCp(resolveTestResource('errors'), tmpDir, { recursive: true });
      process.chdir(tmpDir);
      sut = testInjector.injector.injectFunction(createJasmineTestRunnerFactory('__stryker2__'));
    });

    it('should be able to tell the error', async () => {
      const result = await sut.dryRun(factory.dryRunOptions());
      assertions.expectErrored(result);
      expect(result.errorMessage)
        .matches(/^An error occurred.*/)
        .matches(/.*SyntaxError: Unexpected identifier.*/);
    });
  });

  describe('when it includes failed tests', () => {
    beforeEach(async () => {
      tmpDir = resolveTempTestResourceDirectory();
      await fsPromisesCp(resolveTestResource('test-failures'), tmpDir, { recursive: true });
      process.chdir(tmpDir);
      sut = testInjector.injector.injectFunction(createJasmineTestRunnerFactory('__stryker2__'));
    });

    it('should complete with first test failure (bail)', async () => {
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

    it('should report all failing tests when disableBail is true', async () => {
      const result = await sut.dryRun(factory.dryRunOptions({ disableBail: true }));
      assertions.expectCompleted(result);
      expectTestResultsToEqual(result.tests, [
        {
          id: 'spec0',
          status: TestStatus.Failed,
          failureMessage: "Expected 'bar' to be 'baz'.",
          name: 'foo should be baz',
        },
        {
          id: 'spec1',
          status: TestStatus.Failed,
          failureMessage: "Expected 'bar' to be 'qux'.",
          name: 'foo should be qux',
        },
      ]);
    });
  });
});
