import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createJasmineTestRunnerFactory, JasmineTestRunner } from '../../src';
import { resolveFromRoot, resolveTestResource } from '../helpers/resolve-test-resource';

describe('Infinite loop', () => {
  let sut: JasmineTestRunner;

  beforeEach(async () => {
    process.chdir(resolveTestResource('infinite-loop-instrumented'));
    sut = testInjector.injector.injectFunction(createJasmineTestRunnerFactory('__stryker2__'));
  });
  afterEach(async () => {
    process.chdir(resolveFromRoot());
    await sut.dispose();
  });

  it.skip('should report a timeout eventually and be able to recover from it', async function () {
    // TODO Mocha runner doesn't seem to detect timeout in infinite loop
    this.timeout(1000);

    // This is a slow test, so I decided to put 2 tests into one 🤷‍♀️
    // Act
    const result = await sut.mutantRun(factory.mutantRunOptions());

    // Assert
    assertions.expectTimeout(result);

    // Second test, should be recovered by now.
    const secondResult = await sut.mutantRun(factory.mutantRunOptions({ testFilter: ['spec1'] }));
    assertions.expectSurvived(secondResult);
    expect(secondResult.nrOfTests).eq(1);
  });

  it('should be able to recover using a hit counter', async () => {
    // Time this test, this should be fairly stable because there is large margin
    const startTime = new Date();
    const maxTestDurationMS = 5000;

    const result = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '19' }),
        testFilter: ['spec2'],
        hitLimit: 10,
      })
    );

    // Assert
    assertions.expectTimeout(result);
    expect(result.reason).contains('Hit limit reached');
    expect(new Date().valueOf() - startTime.valueOf(), 'Test took longer than 3 sec to complete, was the hit counter malfunctioning?').lt(
      maxTestDurationMS
    );
  });

  it('should reset hit counter state correctly between runs', async () => {
    const firstResult = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '19' }),
        testFilter: ['spec2'],
        hitLimit: 10,
      })
    );
    const secondResult = await sut.mutantRun(
      factory.mutantRunOptions({
        // 27 is a 'normal' mutant that should be killed
        activeMutant: factory.mutant({ id: '22' }),
        testFilter: ['spec2'],
        hitLimit: 10,
      })
    );

    // Assert
    assertions.expectTimeout(firstResult);
    assertions.expectKilled(secondResult);
  });
});
