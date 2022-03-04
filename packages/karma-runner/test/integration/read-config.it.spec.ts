import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import { TestStatus } from '@stryker-mutator/api/test-runner';
import { expect } from 'chai';

import { createKarmaTestRunner, KarmaTestRunner } from '../../src/karma-test-runner.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('read config integration', () => {
  let sut: KarmaTestRunner | undefined;

  after(async () => {
    await sut?.dispose();
  });

  it('should not override client options in a mocha project', async () => {
    testInjector.options.karma = {
      configFile: resolveTestResource('configs', 'mocha-client-options-karma.conf.js'),
    };
    sut = testInjector.injector.injectFunction(createKarmaTestRunner);
    await sut.init();
    const dryRunResult = await sut.dryRun(factory.dryRunOptions());
    assertions.expectCompleted(dryRunResult);
    expect(dryRunResult.tests).lengthOf(2);
    const [test1, test2] = dryRunResult.tests;
    expect(test1.status).eq(TestStatus.Success);
    expect(test1.id).eq('mocha client options should not override client options');
    assertions.expectFailed(test2);
    expect(test2.id).eq('mocha client options should override bail');
    expect(test2.failureMessage).contains('Expected exception');
  });
  it('should not override client options in a jasmine project', async () => {
    testInjector.options.karma = {
      configFile: resolveTestResource('configs', 'jasmine-client-options-karma.conf.js'),
    };
    sut = testInjector.injector.injectFunction(createKarmaTestRunner);
    await sut.init();
    const dryRunResult = await sut.dryRun(factory.dryRunOptions());
    assertions.expectCompleted(dryRunResult);
    expect(dryRunResult.tests).lengthOf(3);
    const [test1, test2, test3] = dryRunResult.tests;
    expect([test1.name, test2.name, test3.name]).deep.eq([
      'jasmine client options should not override client options',
      'jasmine client options should override "random" options',
      'jasmine client options should override "failFast" options',
    ]);
    expect(test1.status).eq(TestStatus.Success);
    expect(test2.status).eq(TestStatus.Success);
    expect(test3.status).eq(TestStatus.Success);
  });
});
