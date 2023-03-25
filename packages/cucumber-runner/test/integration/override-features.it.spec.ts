import path from 'path';

import {
  assertions,
  factory,
  TempTestDirectorySandbox,
  testInjector,
} from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { CucumberTestRunner } from '../../src/index.js';
import * as pluginTokens from '../../src/plugin-tokens.js';
import { CucumberRunnerWithStrykerOptions } from '../../src/cucumber-runner-with-stryker-options.js';

describe('Running with a profile that has explicitly configured features', () => {
  let sut: CucumberTestRunner;
  let sandbox: TempTestDirectorySandbox;
  const simpleMathFeature = path.join('other-features', 'simple_math.feature');

  beforeEach(async () => {
    const options = testInjector.options as CucumberRunnerWithStrykerOptions;
    options.cucumber = {};
    sandbox = new TempTestDirectorySandbox('overriding-features');
    await sandbox.init();
    sut = testInjector.injector
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(CucumberTestRunner);
  });

  afterEach(async () => {
    await sandbox.dispose();
  });

  it('should be able to filter tests', async () => {
    const result = await sut.mutantRun(
      factory.mutantRunOptions({
        testFilter: [`${simpleMathFeature}:7`],
      })
    );

    assertions.expectSurvived(result);
    expect(result.nrOfTests).eq(1);
  });
});
