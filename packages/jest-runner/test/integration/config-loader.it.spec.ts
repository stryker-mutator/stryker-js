import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { CustomJestConfigLoader } from '../../src/config-loaders/custom-jest-config-loader.js';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options.js';
import { jestTestRunnerFactory } from '../../src/jest-test-runner.js';
import { createJestOptions } from '../helpers/producers.js';

import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('config loader integration', () => {
  let options: JestRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    options = testInjector.options as JestRunnerOptionsWithStrykerOptions;
    options.jest = createJestOptions();
  });

  it('should be able to load config from a child dir and still be able perform a mutant run', async () => {
    process.chdir(resolveTestResource('config-in-child-dir'));
    options.jest.configFile = 'client/jest.config.js';
    const sut = testInjector.injector.injectFunction(jestTestRunnerFactory);
    await sut.init();
    const actual = await sut.dryRun(factory.dryRunOptions());
    assertions.expectCompleted(actual);
    expect(actual.tests).lengthOf(2);
  });
  it('should support a *.ts config file', async () => {
    // Arrange
    process.chdir(resolveTestResource('config-in-ts'));
    const sut = testInjector.injector.injectClass(CustomJestConfigLoader);

    // Act
    const actualJestConfig = await sut.loadConfig();

    // Act
    expect(actualJestConfig.displayName).eq('jest.config.ts example');
  });
});
