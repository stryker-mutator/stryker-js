import { TestRunnerCapabilities } from '@stryker-mutator/api/test-runner';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { CucumberTestRunner } from '../../src';
import * as pluginTokens from '../../src/plugin-tokens';

describe(CucumberTestRunner.name, () => {
  function createSut(): CucumberTestRunner {
    return testInjector.injector
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(CucumberTestRunner);
  }

  it('should communicate reloadEnvironment=true as capability', () => {
    const expectedCapabilities: TestRunnerCapabilities = {
      reloadEnvironment: true,
    };
    expect(createSut().capabilities()).deep.eq(expectedCapabilities);
  });
});
