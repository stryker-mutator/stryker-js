import { expect } from 'chai';
import { factory, TempTestDirectorySandbox, testInjector } from '@stryker-mutator/test-helpers';

import { MutantRunStatus } from '@stryker-mutator/api/test-runner';

import { createTapTestRunnerFactory, TapTestRunner } from '../../src/index.js';

describe('Running in an example project', () => {
  let sut: TapTestRunner;
  let sandbox: TempTestDirectorySandbox;

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('example-instrumented');
    await sandbox.init();
    sut = testInjector.injector.injectFunction(createTapTestRunnerFactory('__stryker2__'));
    await sut.init();
  });
  afterEach(async () => {
    await sandbox.dispose();
  });

  it('should be to run in the example', async () => {
    // Act
    // const result = await sut.dryRun(factory.dryRunOptions({}));
    const mutantRunOptions = factory.mutantRunOptions({ hitLimit: 10, activeMutant: factory.mutant({ id: '1' }) });
    const run = await sut.mutantRun(mutantRunOptions);

    // Assert
    // todo fix this
    expect(true).to.be.true;
  });

  it('should todo hitlimit', async () => {
    // Act
    const mutantRunOptions = factory.mutantRunOptions({ hitLimit: 10, activeMutant: factory.mutant({ id: '7' }) });
    const run = await sut.mutantRun(mutantRunOptions);

    // Assert
    expect(run.status).eq(MutantRunStatus.Timeout);
    if (run.status === MutantRunStatus.Timeout) {
      expect(run.reason).eq('Hit limit reached (11/10)');
    }
  });
});
