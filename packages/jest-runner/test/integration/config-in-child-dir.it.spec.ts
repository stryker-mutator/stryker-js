import { commonTokens } from '@stryker-mutator/api/plugin';
import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { JestOptions } from '../../src-generated/jest-runner-options.js';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options.js';
import { jestTestRunnerFactory } from '../../src/jest-test-runner.js';
import { createJestOptions } from '../helpers/producers.js';

import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('jest with config in child dir', () => {
  function createSut(overrides?: Partial<JestOptions>) {
    const options: JestRunnerOptionsWithStrykerOptions = factory.strykerWithPluginOptions({
      jest: createJestOptions(overrides),
    });
    return testInjector.injector.provideValue(commonTokens.options, options).injectFunction(jestTestRunnerFactory);
  }

  it('should still be able perform a mutant run', async () => {
    process.chdir(resolveTestResource('config-in-child-dir'));
    const sut = createSut({ configFile: 'client/jest.config.js' });
    const actual = await sut.dryRun(factory.dryRunOptions());
    assertions.expectCompleted(actual);
    expect(actual.tests).lengthOf(2);
  });
});
