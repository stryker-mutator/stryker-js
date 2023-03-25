import path from 'path';

import {
  testInjector,
  factory,
  assertions,
  TempTestDirectorySandbox,
} from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import * as pluginTokens from '../../src/plugin-tokens.js';
import { CucumberTestRunner } from '../../src/index.js';
import { CucumberRunnerWithStrykerOptions } from '../../src/cucumber-runner-with-stryker-options.js';

describe('Infinite loop', () => {
  const infiniteLoopFileName = path.join('features', 'infinite-loop.feature');
  let sut: CucumberTestRunner;
  let sandbox: TempTestDirectorySandbox;

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('infinite-loop-instrumented');
    await sandbox.init();

    const options: CucumberRunnerWithStrykerOptions =
      testInjector.options as CucumberRunnerWithStrykerOptions;
    options.cucumber = {};
    sut = testInjector.injector
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(CucumberTestRunner);
  });
  afterEach(async () => {
    await sandbox.dispose();
  });

  it('should be able to recover using a hit counter', async () => {
    // Arrange
    const options = factory.mutantRunOptions({
      activeMutant: factory.mutant({ id: '12' }),
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
        activeMutant: factory.mutant({ id: '12' }),
        testFilter: [`${infiniteLoopFileName}:3`],
        hitLimit: 10,
      })
    );
    const secondResult = await sut.mutantRun(
      factory.mutantRunOptions({
        // 15 is a 'normal' mutant that should be killed
        activeMutant: factory.mutant({ id: '15' }),
        testFilter: [`${infiniteLoopFileName}:3`],
        hitLimit: 10,
      })
    );

    // Assert
    assertions.expectTimeout(firstResult);
    assertions.expectKilled(secondResult);
  });
});
