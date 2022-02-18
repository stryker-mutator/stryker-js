import { commonTokens } from '@stryker-mutator/api/plugin';
import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { JestOptions } from '../../src-generated/jest-runner-options.js';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options.js';
import { jestTestRunnerFactory } from '../../src/jest-test-runner.js';
import { createJestOptions } from '../helpers/producers.js';

import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('jest with fileUnderTest outside of roots', () => {
  function createSut(overrides?: Partial<JestOptions>) {
    const options: JestRunnerOptionsWithStrykerOptions = factory.strykerWithPluginOptions({
      jest: createJestOptions(overrides),
    });
    return testInjector.injector.provideValue(commonTokens.options, options).injectFunction(jestTestRunnerFactory);
  }

  it('should still be able perform a mutant run', async () => {
    process.chdir(resolveTestResource('file-under-test-outside-roots'));
    const sut = createSut({ enableFindRelatedTests: true });
    const actual = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '1' }), sandboxFileName: 'src/foo.js' }));
    assertions.expectKilled(actual);
    expect(actual.killedBy).deep.eq(['foo should be 42']);
  });
});
