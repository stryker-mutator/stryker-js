import {
  assertions,
  factory,
  testInjector,
} from '@stryker-mutator/test-helpers';
import sinon from 'sinon';

import * as pluginTokens from '../../src/plugin-tokens';
import { CucumberTestRunner } from '../../src';
import { CucumberRunnerWithStrykerOptions } from '../../src/cucumber-runner-with-stryker-options';
import { resolveTestResource } from '../helpers/resolve-test-resource';

describe('Cucumber runner timing', () => {
  let options: CucumberRunnerWithStrykerOptions;
  let sut: CucumberTestRunner;

  beforeEach(() => {
    options = testInjector.options as CucumberRunnerWithStrykerOptions;
    options.cucumber = {};
    process.chdir(resolveTestResource('timing'));
    sut = testInjector.injector
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(CucumberTestRunner);
  });

  it('should report time correctly', async () => {
    global.sinonClock = sinon.useFakeTimers();
    global.sinonClock.tick(10001); // 10 seconds above absolute 0 (00:00:10 1 jan 1970)
    // The global `sinon.clock` will be used by the step definition to travel to the future 😇
    const result = await sut.dryRun(factory.dryRunOptions());
    assertions.expectTestResults(result, [{ timeSpentMs: 2001 }]);
  });
});
