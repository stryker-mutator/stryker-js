import os from 'os';

import path from 'path';

import { fileURLToPath } from 'url';

import { expect } from 'chai';
import { factory, TempTestDirectorySandbox, testInjector, assertions } from '@stryker-mutator/test-helpers';
import { DryRunStatus } from '@stryker-mutator/api/test-runner';

import { normalizeFileName } from '@stryker-mutator/util';

import { TapTestRunner } from '../../src/index.js';
import { createTapTestRunnerFactory } from '../../src/tap-test-runner.js';
import { findTestyLookingFiles } from '../../src/tap-helper.js';
import { TapRunnerOptionsWithStrykerOptions } from '../../src/tap-runner-options-with-stryker-options.js';
import { tapRunnerOptions } from '../helpers/factory.js';

describe('tap-runner integration', () => {
  let sut: TapTestRunner;
  let sandbox: TempTestDirectorySandbox;
  let options: TapRunnerOptionsWithStrykerOptions;
  const hooksFile = normalizeFileName(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'setup', 'hook.cjs'));

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

    it('should log the run command to debug level', async () => {
      // Arrange
      testInjector.logger.isDebugEnabled.returns(true);
      options.tap.nodeArgs = ['--enable-source-maps']; // for testing purposes
      const testFile = testFilter[0];

      // Act
      await sut.dryRun(factory.dryRunOptions({ files: testFilter }));

      // Assert
      expect(testInjector.logger.debug).calledWithExactly(
        `Running: \`node "-r" "${hooksFile}" "--enable-source-maps" "${testFile}"\` in ${process.cwd()}`
      );
    });

    it('should not log the run command if debug log level is not enabled', async () => {
      // Arrange
      testInjector.logger.isDebugEnabled.returns(false);

      // Act
      await sut.dryRun(factory.dryRunOptions({ files: testFilter }));

      // Assert
      expect(testInjector.logger.debug).not.called;
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

    [
      { disableBail: false, forceBail: false, shouldBail: false },
      { disableBail: true, forceBail: false, shouldBail: false },
      { disableBail: true, forceBail: true, shouldBail: false },
      { disableBail: false, forceBail: true, shouldBail: true },
    ].forEach(({ disableBail, forceBail, shouldBail }) => {
      it(`should ${shouldBail ? 'bail' : 'not bail'} out process when disableBail is ${disableBail} and forceBail is ${forceBail}`, async () => {
        options.tap.forceBail = forceBail;
        const testFiles = ['tests/bail.spec.js'];
        const startTime = Date.now();

        // Act
        const run = await sut.mutantRun(factory.mutantRunOptions({ testFilter: testFiles, disableBail: disableBail }));
        const timeDiff = Date.now() - startTime;

        // Assert
        assertions.expectKilled(run);
        if (shouldBail) {
          expect(timeDiff).lte(4000);
        } else {
          expect(timeDiff).gte(4000);
        }
      });
    });
  });

  describe('Running on a bogus project', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('bogus');
      await sandbox.init();
      options.tap = tapRunnerOptions({
        testFiles: ['readme.md'], // WAT??? -> Not even a .js file
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

  describe('Running on a ava project', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('ava');
      await sandbox.init();
      const avaLocation = path.resolve(
        sandbox.tmpDir,
        ...(process.env.STRYKER_MUTATOR_WORKER ? ['..', '..'] : []),
        '..',
        '..',
        '..',
        '..',
        '..',
        'node_modules',
        'ava',
        'entrypoints',
        'cli.mjs'
      );
      options.disableBail = true;
      options.tap = tapRunnerOptions({
        nodeArgs: [avaLocation, '--tap'],
      });
      sut = testInjector.injector.injectFunction(createTapTestRunnerFactory('__stryker2__'));
      await sut.init();
    });

    it('should be able to run', async function () {
      // Act
      const run = await sut.dryRun(factory.dryRunOptions());

      // Assert
      assertions.expectCompleted(run);
    });
  });
});
