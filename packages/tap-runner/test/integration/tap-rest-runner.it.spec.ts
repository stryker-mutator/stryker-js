import { expect } from 'chai';
import { factory, TempTestDirectorySandbox, testInjector } from '@stryker-mutator/test-helpers';

import { TapTestRunner } from '../../src/index.js';

describe('Running in an example project', () => {
  let sut: TapTestRunner;
  let sandbox: TempTestDirectorySandbox;

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('example');
    await sandbox.init();
    sut = testInjector.injector.injectClass(TapTestRunner);
    await sut.init();
  });
  afterEach(async () => {
    await sandbox.dispose();
  });

  it('should be to run in the example', async () => {
    // Act
    const run = await sut.mutantRun(factory.mutantRunOptions());

    // Assert
    expect(true).to.be.true;
  });
});
