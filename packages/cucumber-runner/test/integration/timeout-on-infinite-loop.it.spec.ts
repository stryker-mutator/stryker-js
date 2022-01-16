import path from 'path';

import {
  testInjector,
  factory,
  assertions,
} from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import * as pluginTokens from '../../src/plugin-tokens';
import { CucumberTestRunner } from '../../src';
import { CucumberRunnerWithStrykerOptions } from '../../src/cucumber-runner-with-stryker-options';
import { resolveTestResource } from '../helpers/resolve-test-resource';

describe('Infinite loop', () => {
  const infiniteLoopFileName = path.join('features', 'infinite-loop.feature');
  let sut: CucumberTestRunner;

  beforeEach(async () => {
    process.chdir(resolveTestResource('infinite-loop-instrumented'));
    const options: CucumberRunnerWithStrykerOptions =
      testInjector.options as CucumberRunnerWithStrykerOptions;
    options.cucumber = {};
    sut = testInjector.injector
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(CucumberTestRunner);
  });

  it('should be able to recover using a hit counter', async () => {
    // Arrange
    const options = factory.mutantRunOptions({
      activeMutant: factory.mutantTestCoverage({ id: '12' }),
      testFilter: [`${infiniteLoopFileName}:3`],
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
        activeMutant: factory.mutantTestCoverage({ id: '12' }),
        testFilter: [`${infiniteLoopFileName}:3`],
        hitLimit: 10,
      })
    );
    const secondResult = await sut.mutantRun(
      factory.mutantRunOptions({
        // 15 is a 'normal' mutant that should be killed
        activeMutant: factory.mutantTestCoverage({ id: '15' }),
        testFilter: [`${infiniteLoopFileName}:3`],
        hitLimit: 10,
      })
    );

    // Assert
    assertions.expectTimeout(firstResult);
    assertions.expectKilled(secondResult);
  });
});
