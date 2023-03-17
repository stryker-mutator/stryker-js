import { expect } from 'chai';
import { factory, TempTestDirectorySandbox, testInjector } from '@stryker-mutator/test-helpers';

import { DryRunStatus, MutantRunStatus } from '@stryker-mutator/api/test-runner';

import { TapTestRunner } from '../../src/index.js';
import { createTapTestRunnerFactory } from '../../src/tap-test-runner.js';

describe('Running in an example project', () => {
  let sut: TapTestRunner;
  let sandbox: TempTestDirectorySandbox;

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('example');
    await sandbox.init();
    sut = testInjector.injector.injectFunction(createTapTestRunnerFactory('__stryker2__'));
    await sut.init();
  });
  afterEach(async () => {
    await sandbox.dispose();
  });

  it('should be to dry run', async () => {
    // Act
    const run = await sut.dryRun(factory.dryRunOptions());

    // Assert
    expect(run.status).eq(DryRunStatus.Complete);
  });

  it('should be to run mutantRun', async () => {
    // Act
    const run = await sut.mutantRun(factory.mutantRunOptions());

    // Assert
    expect(run.status).eq(MutantRunStatus.Survived);
    if (run.status == MutantRunStatus.Survived) {
      expect(run.nrOfTests).eq(5);
    }
  });

  it('should be able to run test file with random output', async () => {
    const testFiles = ['tests/random-output.spec.js'];
    const run = await sut.mutantRun(factory.mutantRunOptions({ testFilter: testFiles }));
    expect(run.status).eq(MutantRunStatus.Survived);
  });

  it('should be able to run test file without output', async () => {
    const testFiles = ['tests/no-output.spec.js'];
    const run = await sut.mutantRun(factory.mutantRunOptions({ testFilter: testFiles }));
    expect(run.status).eq(MutantRunStatus.Survived);
  });
});
