import os from 'os';

import { expect } from 'chai';
import { factory, TempTestDirectorySandbox, testInjector, assertions } from '@stryker-mutator/test-helpers';
import { DryRunStatus } from '@stryker-mutator/api/test-runner';

import { TapTestRunner } from '../../src/index.js';
import { createTapTestRunnerFactory } from '../../src/tap-test-runner.js';
import { findTestyLookingFiles } from '../../src/tap-helper.js';

describe('Running in an example project', () => {
  let sut: TapTestRunner;
  let sandbox: TempTestDirectorySandbox;
  let testFilter: string[] = [];

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('example');
    await sandbox.init();
    sut = testInjector.injector.injectFunction(createTapTestRunnerFactory('__stryker2__'));
    await sut.init();

    const excludeFiles = ['tests/bail.spec.js', 'tests/error.spec.js'];
    testFilter = (await findTestyLookingFiles()).filter((file) => !excludeFiles.includes(file));
  });
  afterEach(async () => {
    await sandbox.dispose();
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
    expect(run.killedBy).deep.eq(['tests/bail.spec.js', 'tests/error.spec.js']);
    expect(run.failureMessage).eq('Failing test: This test will fail, Failing test: This test will fail also');
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
