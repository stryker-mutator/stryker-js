import {
  assertions,
  factory,
  TempTestDirectorySandbox,
  testInjector,
} from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import * as pluginTokens from '../../src/plugin-tokens.js';
import { CucumberTestRunner } from '../../src/index.js';
import { CucumberRunnerWithStrykerOptions } from '../../src/cucumber-runner-with-stryker-options.js';

describe('Cucumber runner timing', () => {
  let options: CucumberRunnerWithStrykerOptions;
  let sut: CucumberTestRunner;
  let sandbox: TempTestDirectorySandbox;

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('timing');
    await sandbox.init();
    options = testInjector.options as CucumberRunnerWithStrykerOptions;
    options.cucumber = {};
    sut = testInjector.injector
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(CucumberTestRunner);
  });
  afterEach(async () => {
    await sandbox.dispose();
  });

  it('should report time correctly', async () => {
    const result = await sut.dryRun(factory.dryRunOptions());
    assertions.expectCompleted(result);
    expect(result.tests).lengthOf(1);
    expect(result.tests[0].timeSpentMs).greaterThanOrEqual(200).lessThan(300);
  });
});
