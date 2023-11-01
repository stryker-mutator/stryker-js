import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

import { expect } from 'chai';
import { factory, TempTestDirectorySandbox, testInjector, assertions } from '@stryker-mutator/test-helpers';
import { DryRunStatus, KilledMutantRunResult } from '@stryker-mutator/api/test-runner';
import { normalizeFileName } from '@stryker-mutator/util';

import { TapTestRunner } from '../../src/index.js';
import { createTapTestRunnerFactory } from '../../src/tap-test-runner.js';
import { findTestyLookingFiles } from '../../src/tap-helper.js';
import { TapRunnerOptionsWithStrykerOptions } from '../../src/tap-runner-options-with-stryker-options.js';
import { tapRunnerOptions } from '../helpers/factory.js';

// This is the setTimeout timer from "testResources/example/tests/bail.spec.js"
const BAIL_TIMEOUT = 2000;

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
      const [testFile] = testFilter;

      // Act
      await sut.dryRun(factory.dryRunOptions({ files: testFilter }));

      // Assert
      expect(testInjector.logger.debug).calledWithExactly(
        `Running: \`node "-r" "${hooksFile}" "--enable-source-maps" "${testFile}"\` in ${process.cwd()}`,
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

    it('should be able to run mutantRun that gets killed', async () => {
      // Act
      const testFiles = ['tests/error.spec.js'];
      const run = await sut.mutantRun(factory.mutantRunOptions({ disableBail: true, testFilter: testFiles }));

      // Assert
      assertions.expectKilled(run);
      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      expect([...run.killedBy].sort()).deep.eq(['tests/error.spec.js']);
      expect(run.failureMessage).eq('Concat two strings > An error occurred: An error occurred');
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

    const bailedFailureMessage = 'Failing test > This test will fail: This test will fail';
    const notBailedFailureMessage =
      'Failing test > This test will fail: This test will fail, This long tests could be bailed > 3hours is not 3hours: 3hours is not 3hours';
    it('should not bail out process when disableBail is false and forceBail is false', async () => {
      // Arrange/Act
      const run = await arrangeAndActBail(false, false);

      // Assert
      expect(run.failureMessage).eq(notBailedFailureMessage);
      expect(run.killedBy).lengthOf(1);
    });

    it('should not bail out process when disableBail is false and forceBail is true', async () => {
      // Arrange/Act
      const run = await arrangeAndActBail(true, true);

      // Assert
      expect(run.failureMessage).eq(notBailedFailureMessage);
      expect(run.killedBy).lengthOf(2);
    });

    it('should not bail out process when disableBail is true and forceBail is false', async () => {
      // Arrange/Act
      const run = await arrangeAndActBail(true, false);

      // Assert
      expect(run.failureMessage).eq(notBailedFailureMessage);
      expect(run.killedBy).lengthOf(2);
    });

    it('should bail out process when disableBail is false and forceBail is true', async () => {
      // Arrange/Act
      const run = await arrangeAndActBail(false, true);

      // Assert
      expect(run.failureMessage).eq(bailedFailureMessage);
      expect(run.killedBy).lengthOf(1);
    });

    it('should return result faster when bailing (on unix)', async function () {
      if (os.platform() === 'win32') {
        this.skip();
      }

      // Arrange/Act
      const start = new Date();
      await arrangeAndActBail(false, true);
      const end = new Date();
      const timeDiff = end.getTime() - start.getTime();

      // Assert
      expect(timeDiff).lte(BAIL_TIMEOUT);
    });

    it('should return result slow when not bailing (on unix)', async function () {
      if (os.platform() === 'win32') {
        this.skip();
      }

      // Arrange/Act
      const start = new Date();
      await arrangeAndActBail(false, false);
      const end = new Date();
      const timeDiff = end.getTime() - start.getTime();

      // Assert
      expect(timeDiff).gte(BAIL_TIMEOUT);
    });

    async function arrangeAndActBail(disableBail: boolean, forceBail: boolean): Promise<KilledMutantRunResult> {
      options.tap.forceBail = forceBail;
      const testFiles = ['tests/bail.spec.js', 'tests/error.spec.js'];

      // Act
      const run = await sut.mutantRun(factory.mutantRunOptions({ testFilter: testFiles, disableBail: disableBail }));

      assertions.expectKilled(run);
      return run;
    }
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
        'cli.mjs',
      );
      options.forceBail = false;
      options.tap = tapRunnerOptions({
        nodeArgs: [avaLocation, '--tap'],
      });
      sut = testInjector.injector.injectFunction(createTapTestRunnerFactory('__stryker2__'));
      await sut.init();
    });

    it('should be able to run', async () => {
      // Act
      const run = await sut.dryRun(factory.dryRunOptions());

      // Assert
      assertions.expectCompleted(run);
    });

    it('should return a valid timeSpentMs', async () => {
      // Act
      const run = await sut.dryRun(factory.dryRunOptions());

      // Assert
      assertions.expectCompleted(run);
      expect(run.tests[0].timeSpentMs).to.be.greaterThan(0);
    });
  });
});
