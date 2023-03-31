import { expect } from 'chai';
import { assertions, factory, TempTestDirectorySandbox, testInjector } from '@stryker-mutator/test-helpers';

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

  it('should be able run instrumented file', async () => {
    // Act
    await sut.dryRun(factory.dryRunOptions({}));
    const mutantRunOptions = factory.mutantRunOptions({ hitLimit: 10, activeMutant: factory.mutant({ id: '1' }) });
    const run = await sut.mutantRun(mutantRunOptions);

    // Assert
    assertions.expectKilled(run);
    expect(run.failureMessage).eq('Adding two numbers: Adding 10 and 5 equal to 15');
  });

  it('should be able to determine hit limit', async () => {
    // Act
    const mutantRunOptions = factory.mutantRunOptions({ hitLimit: 10, activeMutant: factory.mutant({ id: '7' }) });
    await sut.dryRun(factory.dryRunOptions({}));
    const run = await sut.mutantRun(mutantRunOptions);

    // Assert
    assertions.expectTimeout(run);
    expect(run.reason).eq('Hit limit reached (11/10)');
  });
});
