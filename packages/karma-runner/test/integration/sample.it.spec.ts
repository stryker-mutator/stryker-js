import { TestStatus } from '@stryker-mutator/api/test_runner';
import { testInjector } from '@stryker-mutator/test-helpers';
import * as path from 'path';
import KarmaTestRunner from '../../src/KarmaTestRunner';
import { expectTestResults } from '../helpers/assertions';

describe('Sample project', () => {
  it('should be able to run karma', async () => {
    testInjector.options.karma = { configFile: path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'karma.conf.js') };
    const runner = testInjector.injector.injectClass(KarmaTestRunner);
    await runner.init();
    const result = await runner.run({});
    expectTestResults(result, [
      {
        name: 'Add should be able to add two numbers and add one',
        status: TestStatus.Failed
      },
      {
        name: 'Add should be to add able 1 to a number and actually add 2',
        status: TestStatus.Failed
      },
      {
        name: 'Add should be able to add two numbers',
        status: TestStatus.Success
      },
      {
        name: 'Add should be able 1 to a number',
        status: TestStatus.Success
      },
      {
        name: 'Add should be able negate a number',
        status: TestStatus.Success
      },
      {
        name: 'Add should be able to recognize a negative number',
        status: TestStatus.Success
      },
      {
        name: 'Add should be able to recognize that 0 is not a negative number',
        status: TestStatus.Success
      },
      {
        name: 'Circle should have a circumference of 2PI when the radius is 1',
        status: TestStatus.Success
      },
      {
        name: 'Add this test should fail',
        status: TestStatus.Failed
      }
    ]);
  });
});
