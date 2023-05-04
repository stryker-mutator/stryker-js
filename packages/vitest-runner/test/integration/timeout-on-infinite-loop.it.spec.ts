import { testInjector, factory, assertions, TempTestDirectorySandbox } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createVitestTestRunnerFactory, VitestTestRunner } from '../../src/vitest-test-runner.js';

describe('Infinite loop', () => {
  let sut: VitestTestRunner;
  let sandbox: TempTestDirectorySandbox;

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('infinite-loop-instrumented');
    await sandbox.init();
    sut = testInjector.injector.injectFunction(createVitestTestRunnerFactory('__stryker2__'));
  });
  afterEach(async () => {
    await sut.dispose();
    await sandbox.dispose();
  });

  it('should be able to recover using a hit counter', async () => {
    // Arrange
    await sut.init();
    const options = factory.mutantRunOptions({
      activeMutant: factory.mutant({ id: '19' }),
      testFilter: ['infinite-loop.spec.js'],
      hitLimit: 10,
    });

    // Act
    const result = await sut.mutantRun(options);

    // Assert
    assertions.expectTimeout(result);
    expect(result.reason).contains('Hit limit reached');
  });

  it('should reset hit counter state correctly between runs', async () => {
    await sut.init();
    const firstResult = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '19' }),
        testFilter: ['infinite-loop.spec.js'],
        hitLimit: 10,
        mutantActivation: 'static',
      })
    );
    const secondResult = await sut.mutantRun(
      factory.mutantRunOptions({
        // 22 is a 'normal' mutant that should be killed
        activeMutant: factory.mutant({ id: '22' }),
        testFilter: ['infinite-loop.spec.js'],
        hitLimit: 10,
        mutantActivation: 'static',
      })
    );

    // Assert
    assertions.expectTimeout(firstResult);
    assertions.expectKilled(secondResult);
  });
});
