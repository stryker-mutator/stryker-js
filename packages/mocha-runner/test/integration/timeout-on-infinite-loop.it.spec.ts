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

  it('should be able to recover using a hit counter', async () => {
    // Arrange
    const options = factory.mutantRunOptions({
      activeMutant: factory.mutant({ id: '20' }),
      testFilter: ['should be able to break out of an infinite loop with a hit counter'],
      hitLimit: 10,
    });

    // Act
    const result = await sut.mutantRun(options);

    // Assert
    assertions.expectTimeout(result);
    expect(result.reason).contains('Hit limit reached');
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
        // 23 is a 'normal' mutant that should be killed
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
