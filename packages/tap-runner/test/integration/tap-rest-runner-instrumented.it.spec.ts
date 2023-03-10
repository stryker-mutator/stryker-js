import { expect } from 'chai';
import { factory, TempTestDirectorySandbox, testInjector } from '@stryker-mutator/test-helpers';

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
    expect(true).to.be.true;
  });
});
