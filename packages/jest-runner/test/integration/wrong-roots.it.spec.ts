import { commonTokens } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { JestOptions } from '../../src-generated/jest-runner-options';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options';
import { jestTestRunnerFactory } from '../../src/jest-test-runner';
import { createJestOptions } from '../helpers/producers';

import { resolveTestResource } from '../helpers/resolve-test-resource';

describe('jest with wrong roots', () => {
  function createSut(overrides?: Partial<JestOptions>) {
    const options: JestRunnerOptionsWithStrykerOptions = factory.strykerWithPluginOptions({
      jest: createJestOptions(overrides),
    });
    return testInjector.injector.provideValue(commonTokens.options, options).injectFunction(jestTestRunnerFactory);
  }

  it.only('should error during mutantRun when findRelatedTests is enabled', async () => {
    process.chdir(resolveTestResource('wrong-roots'));
    const sut = createSut({ enableFindRelatedTests: true });
    await expect(sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant(), sandboxFileName: 'src/foo.js' }))).rejectedWith();
  });
});
