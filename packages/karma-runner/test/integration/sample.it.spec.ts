import * as path from 'path';

import { TestStatus } from '@stryker-mutator/api/test_runner';
import { testInjector, assertions, factory } from '@stryker-mutator/test-helpers';

import KarmaTestRunner from '../../src/KarmaTestRunner';
import { expectTestResults, TimelessTestResult } from '../helpers/assertions';

describe('Sample project', () => {
  it('should be able to run karma', async () => {
    testInjector.options.karma = { configFile: path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'karma.conf.js') };
    const runner = testInjector.injector.injectClass(KarmaTestRunner);
    await runner.init();
    const result = await runner.dryRun(factory.dryRunOptions());
    assertions.expectCompleted(result);
    const expectedTestResults: TimelessTestResult[] = [
      {
        id: 'spec0',
        name: 'Add should be able to add two numbers and add one',
        status: TestStatus.Failed,
        failureMessage: 'Error: Expected 7 to be 8.',
      },
      {
        id: 'spec1',
        name: 'Add should be to add able 1 to a number and actually add 2',
        status: TestStatus.Failed,
        failureMessage: 'Error: Expected 3 to be 4.',
      },
      {
        id: 'spec2',
        name: 'Add should be able to add two numbers',
        status: TestStatus.Success,
      },
      {
        id: 'spec3',
        name: 'Add should be able 1 to a number',
        status: TestStatus.Success,
      },
      {
        id: 'spec4',
        name: 'Add should be able negate a number',
        status: TestStatus.Success,
      },
      {
        id: 'spec5',
        name: 'Add should be able to recognize a negative number',
        status: TestStatus.Success,
      },
      {
        id: 'spec6',
        name: 'Add should be able to recognize that 0 is not a negative number',
        status: TestStatus.Success,
      },
      {
        id: 'spec7',
        name: 'Circle should have a circumference of 2PI when the radius is 1',
        status: TestStatus.Success,
      },
      {
        id: 'spec8',
        name: 'Add this test should fail',
        status: TestStatus.Failed,
        failureMessage: 'Error: Expected 7 to be 0.',
      },
    ];
    expectTestResults(result, expectedTestResults);
  });
});
