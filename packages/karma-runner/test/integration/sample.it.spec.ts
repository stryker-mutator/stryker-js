import { TestStatus } from '@stryker-mutator/api/test-runner';
import { testInjector, assertions, factory } from '@stryker-mutator/test-helpers';

import { KarmaTestRunner } from '../../src/karma-test-runner';
import { expectTestResults, TimelessTestResult } from '../helpers/assertions';
import { KarmaRunnerOptionsWithStrykerOptions } from '../../src/karma-runner-options-with-stryker-options';
import { resolveTestResource } from '../helpers/resolve-test-resource';

describe('Sample project', () => {
  let sut: KarmaTestRunner | undefined;

  afterEach(async () => {
    await sut?.dispose();
  });

  it('should be able to run karma with jasmine', async () => {
    testInjector.options.karma = { configFile: resolveTestResource('sampleProject', 'karma-jasmine.conf.js') };
    sut = testInjector.injector.injectClass(KarmaTestRunner);
    await sut.init();
    const result = await sut.dryRun(factory.dryRunOptions());
    assertions.expectCompleted(result);
    const expectedTestResults: TimelessTestResult[] = [
      {
        id: 'spec0',
        name: 'Add should be able to add two numbers',
        status: TestStatus.Success,
      },
      {
        id: 'spec1',
        name: 'Add should be able 1 to a number',
        status: TestStatus.Success,
      },
      {
        id: 'spec2',
        name: 'Add should be able negate a number',
        status: TestStatus.Success,
      },
      {
        id: 'spec3',
        name: 'Add should be able to recognize a negative number',
        status: TestStatus.Success,
      },
      {
        id: 'spec4',
        name: 'Add should be able to recognize that 0 is not a negative number',
        status: TestStatus.Success,
      },
      {
        id: 'spec5',
        name: 'Circle should have a circumference of 2PI when the radius is 1',
        status: TestStatus.Success,
      },
      {
        id: 'spec6',
        name: 'Add this test should fail',
        status: TestStatus.Failed,
        failureMessage: 'Error: Expected 7 to be 0.',
      },
    ];
    expectTestResults(result, expectedTestResults);
  });

  it('should be able to run karma with mocha', async () => {
    (testInjector.options as KarmaRunnerOptionsWithStrykerOptions).karma = {
      projectType: 'custom',
      configFile: resolveTestResource('sampleProject', 'karma-mocha.conf.js'),
    };

    sut = testInjector.injector.injectClass(KarmaTestRunner);
    await sut.init();
    const result = await sut.dryRun(factory.dryRunOptions());
    assertions.expectCompleted(result);
    const expectedTestResults: TimelessTestResult[] = [
      {
        id: 'Add should be able to add two numbers',
        name: 'Add should be able to add two numbers',
        status: TestStatus.Success,
      },
      {
        id: 'Add should be able 1 to a number',
        name: 'Add should be able 1 to a number',
        status: TestStatus.Success,
      },
      {
        id: 'Add should be able negate a number',
        name: 'Add should be able negate a number',
        status: TestStatus.Success,
      },
      {
        id: 'Add should be able to recognize a negative number',
        name: 'Add should be able to recognize a negative number',
        status: TestStatus.Success,
      },
      {
        id: 'Add should be able to recognize that 0 is not a negative number',
        name: 'Add should be able to recognize that 0 is not a negative number',
        status: TestStatus.Success,
      },
    ];
    expectTestResults(result, expectedTestResults);
  });
});
