import { JestTestRunner, createJestTestRunnerFactory } from '../../src/jest-test-runner';
import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';

import { JestOptions } from '../../src-generated/jest-runner-options';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { createJestOptions } from '../helpers/producers';
import { expect } from 'chai';
import path from 'path';
import { resolveTestResource } from '../helpers/resolve-test-resource';

const jestTestRunnerFactory = createJestTestRunnerFactory('__stryker2__');

describe('Infinite Loop', () => {
  let sut: JestTestRunner;

  function createSut(overrides?: Partial<JestOptions>) {
    const options: JestRunnerOptionsWithStrykerOptions = factory.strykerWithPluginOptions({
      jest: createJestOptions(overrides),
    });
    return testInjector.injector.provideValue(commonTokens.options, options).injectFunction(jestTestRunnerFactory);
  }

  it.skip('should be able to recover using a hit counter', async () => {
    const exampleProjectRoot = resolveTestResource('infinite-loop-instrumented');
    process.chdir(exampleProjectRoot);
    sut = createSut();
    const result = await sut.mutantRun(
      factory.mutantRunOptions({
        testFilter: ['Add should be able to recognize a negative number'],
        activeMutant: factory.mutant({ id: '24' }),
        sandboxFileName: require.resolve(path.resolve(exampleProjectRoot, 'infinite-loop.js')),
        hitLimit: 10,
      })
    );
    assertions.expectTimeout(result);
    expect(result.reason).contains('Hit limit reached');
  });

  it.skip('should reset hit counter state correctly between runs', async () => {
    const firstResult = await sut.mutantRun(
      factory.mutantRunOptions({
        testFilter: ['Add should be able to recognize a negative number'],
        activeMutant: factory.mutant({ id: '24' }),
        sandboxFileName: 'infinite-loop.js',
        // sandboxFileName: require.resolve(path.resolve(exampleProjectRoot, 'infinite-loop.js')),
        hitLimit: 10,
      })
    );
    const secondResult = await sut.mutantRun(
      factory.mutantRunOptions({
        testFilter: ['Add should be able to recognize a negative number'],
        activeMutant: factory.mutant({ id: '27' }),
        sandboxFileName: 'infinite-loop.js',
        hitLimit: 10,
      })
    );

    assertions.expectTimeout(firstResult);
    assertions.expectKilled(secondResult);
  });
});
