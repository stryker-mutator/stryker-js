import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createMochaOptions } from '../helpers/factories';
import { createMochaTestRunnerFactory, MochaTestRunner } from '../../src';
import { resolveTestResource } from '../helpers/resolve-test-resource';

describe('Infinite loop', () => {
  let sut: MochaTestRunner;

  beforeEach(async () => {
    const spec = [
      resolveTestResource('infinite-loop-instrumented', 'infinite-loop.spec.js'),
      resolveTestResource('infinite-loop', 'infinite-loop.spec.js'),
    ];
    testInjector.options.mochaOptions = createMochaOptions({ spec });
    sut = testInjector.injector.injectFunction(createMochaTestRunnerFactory('__stryker2__'));
    await sut.init();
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
    const secondResult = await sut.mutantRun(factory.mutantRunOptions({ testFilter: ['should be able to recover and test others'] }));
    assertions.expectSurvived(secondResult);
    expect(secondResult.nrOfTests).eq(1);
  });

  it('should be able to recover using a hit counter', async () => {
    // Time this test, this should be fairly stable because there is large margin
    const startTime = new Date();
    const maxTestDurationMS = 5000;

    const result = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '20' }),
        testFilter: ['should be able to break out of an infinite loop with a hit counter'],
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
        activeMutant: factory.mutant({ id: '20' }),
        testFilter: ['should be able to break out of an infinite loop with a hit counter'],
        hitLimit: 10,
      })
    );
    const secondResult = await sut.mutantRun(
      factory.mutantRunOptions({
        // 27 is a 'normal' mutant that should be killed
        activeMutant: factory.mutant({ id: '23' }),
        testFilter: ['should be able to break out of an infinite loop with a hit counter'],
        hitLimit: 10,
      })
    );

    // Assert
    assertions.expectTimeout(firstResult);
    assertions.expectKilled(secondResult);
  });
});
