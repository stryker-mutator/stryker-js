import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createKarmaTestRunner, KarmaTestRunner } from '../../src/karma-test-runner.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('Infinite loop', () => {
  let sut: KarmaTestRunner;
  beforeEach(async () => {
    const karmaOptions = {
      config: {
        browsers: ['ChromeHeadless'],
        frameworks: ['mocha'],
        files: [resolveTestResource('infinite-loop', 'infinite-loop.instrumented.js'), resolveTestResource('infinite-loop', 'infinite-loop.spec.js')],
      },
    };
    testInjector.options.karma = karmaOptions;
    sut = testInjector.injector.injectFunction(createKarmaTestRunner);
    await sut.init();
  });
  afterEach(async () => {
    await sut.dispose();
  });

  it('should report a timeout eventually and be able to recover from it', async function () {
    if (process.platform === 'win32') {
      console.log('SKIP. Test is flaky on windows 🤷‍♀️');
      this.skip();
    } else {
      // This is a slow test, so I decided to put 2 tests into one 🤷‍♀️
      // Act
      const result = await sut.mutantRun(factory.mutantRunOptions());

      // Assert
      assertions.expectTimeout(result);
      expect(result.reason).contains('Browser disconnected during test execution');

      // Second test, should be recovered by now.
      const secondResult = await sut.mutantRun(factory.mutantRunOptions({ testFilter: ['should be able to recover and test others'] }));
      assertions.expectSurvived(secondResult);
      expect(secondResult.nrOfTests).eq(1);
    }
  });

  it('should be able to recover using a hit counter', async () => {
    // Time this test, this should be fairly stable because there is large margin
    const startTime = new Date();
    const maxTestDurationMS = 5000;

    const result = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '24' }),
        testFilter: ['should be able to break out of an infinite loop with a hit counter'],
        hitLimit: 10,
      }),
    );

    // Assert
    assertions.expectTimeout(result);
    expect(result.reason).contains('Hit limit reached');
    expect(new Date().valueOf() - startTime.valueOf(), 'Test took longer than 3 sec to complete, was the hit counter malfunctioning?').lt(
      maxTestDurationMS,
    );
  });

  it('should reset hit counter state correctly between runs', async () => {
    const firstResult = await sut.mutantRun(
      factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '24' }),
        testFilter: ['should be able to break out of an infinite loop with a hit counter'],
        hitLimit: 10,
      }),
    );
    const secondResult = await sut.mutantRun(
      factory.mutantRunOptions({
        // 27 is a 'normal' mutant that should be killed
        activeMutant: factory.mutant({ id: '27' }),
        testFilter: ['should be able to break out of an infinite loop with a hit counter'],
        hitLimit: 10,
      }),
    );

    // Assert
    assertions.expectTimeout(firstResult);
    assertions.expectKilled(secondResult);
  });
});
