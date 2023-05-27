import os from 'os';

import { expect } from 'chai';
import { factory, TempTestDirectorySandbox, testInjector, assertions } from '@stryker-mutator/test-helpers';
import { DryRunStatus } from '@stryker-mutator/api/test-runner';

import { TapTestRunner } from '../../src/index.js';
import { createTapTestRunnerFactory } from '../../src/tap-test-runner.js';
import { findTestyLookingFiles } from '../../src/tap-helper.js';
import { TapRunnerOptionsWithStrykerOptions } from '../../src/tap-runner-options-with-stryker-options.js';
import { tapRunnerOptions } from '../helpers/factory.js';

describe('tap-runner integration', () => {
  let sut: TapTestRunner;
  let sandbox: TempTestDirectorySandbox;
  let options: TapRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    options = testInjector.options as TapRunnerOptionsWithStrykerOptions;
    options.tap = tapRunnerOptions();
  });
  afterEach(async () => {
    await sandbox.dispose();
  });

  describe('Running in an example project', () => {
    let testFilter: string[] = [];

    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('example');
      await sandbox.init();
      sut = testInjector.injector.injectFunction(createTapTestRunnerFactory('__stryker2__'));
      await sut.init();

      const excludeFiles = ['tests/bail.spec.js', 'tests/error.spec.js'];
      testFilter = (await findTestyLookingFiles(options.tap.testFiles)).filter((file) => !excludeFiles.includes(file));
    });

    it('should be able complete a dry run', async () => {
      // Act
      const run = await sut.dryRun(factory.dryRunOptions({ files: testFilter }));

      // Assert
      expect(run.status).eq(DryRunStatus.Complete);
    });

    it('should be to run mutantRun that survives', async () => {
      // Act
      const run = await sut.mutantRun(factory.mutantRunOptions({ testFilter }));

      // Assert
      assertions.expectSurvived(run);
      expect(run.nrOfTests).eq(5);
    });

    it('should be to run mutantRun that gets killed', async () => {
      // Act
      const run = await sut.mutantRun(factory.mutantRunOptions({ disableBail: true }));

      // Assert
      assertions.expectKilled(run);
      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      expect([...run.killedBy].sort()).deep.eq(['tests/bail.spec.js', 'tests/error.spec.js']);
      expect(run.failureMessage).eq('Concat two strings: An error occurred');
    });

    it('should be able to run test file with random output', async () => {
      const testFiles = ['tests/random-output.spec.js'];

      // Act
      const run = await sut.mutantRun(factory.mutantRunOptions({ testFilter: testFiles }));
      // Assert
      assertions.expectSurvived(run);
    });

    it('should be able to run test file without output', async () => {
      const testFiles = ['tests/no-output.spec.js'];
      // Act
      const run = await sut.mutantRun(factory.mutantRunOptions({ testFilter: testFiles }));

      // Assert
      assertions.expectSurvived(run);
    });

    it('should bail out when disableBail is false', async () => {
      const testFiles = ['tests/bail.spec.js', 'tests/formatter.spec.js'];

      // Act
      const run = await sut.mutantRun(factory.mutantRunOptions({ testFilter: testFiles, disableBail: false }));

      // Assert
      assertions.expectKilled(run);
      expect(run.nrOfTests).eq(1);
      expect(run.killedBy[0]).eq('tests/bail.spec.js');
    });

    it('should not bail out when disableBail is true', async () => {
      const testFiles = ['tests/bail.spec.js', 'tests/formatter.spec.js'];

      // Act
      const run = await sut.mutantRun(factory.mutantRunOptions({ testFilter: testFiles, disableBail: true }));

      // Assert
      assertions.expectKilled(run);
      expect(run.nrOfTests).eq(testFiles.length);
    });

    it('should bail out current process when disableBail is false and os type is not windows', async function () {
      if (os.platform() === 'win32') {
        this.skip();
      } else {
        const testFiles = ['tests/bail.spec.js'];
        const startTime = Date.now();

        // Act
        const run = await sut.mutantRun(factory.mutantRunOptions({ testFilter: testFiles, disableBail: false }));
        const endTime = Date.now();

        // Assert
        assertions.expectKilled(run);
        expect(run.failureMessage).contains('This test will fail');
        expect(endTime - startTime).at.most(4000);
      }
    });

    it('should not bail out current process when disableBail is true', async () => {
      const testFiles = ['tests/bail.spec.js'];
      const startTime = Date.now();

      // Act
      const run = await sut.mutantRun(factory.mutantRunOptions({ testFilter: testFiles, disableBail: true }));
      const endTime = Date.now();

      // Assert
      assertions.expectKilled(run);
      expect(endTime - startTime).gte(4000);
    });
  });

  describe('Running on a bogus project', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('bogus');
      await sandbox.init();
      options.tap = tapRunnerOptions({
        testFiles: 'readme.md', // WAT??? -> Not even a .js file
      });
      sut = testInjector.injector.injectFunction(createTapTestRunnerFactory('__stryker2__'));
      await sut.init();
    });

    it('should report an error on dry run', async () => {
      // Act
      const run = await sut.dryRun(factory.dryRunOptions());

      // Assert
      assertions.expectErrored(run);
      expect(run.errorMessage).contains('Error running file "readme.md". Tap process exited with code 1');
    });
  });

  describe('Running on a typescript project', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('ts-example');
      await sandbox.init();
      options.tap = tapRunnerOptions({
        nodeArgs: ['--loader', 'ts-node/esm'],
      });
      sut = testInjector.injector.injectFunction(createTapTestRunnerFactory('__stryker2__'));
      await sut.init();
    });

    it('should be able to run with a --loader', async () => {
      // Act
      const run = await sut.dryRun(factory.dryRunOptions());

      // Assert
      assertions.expectCompleted(run);
    });
  });
});
