import { TestStatus } from 'stryker-api/test_runner';
import { Config } from 'stryker-api/config';
import * as path from 'path';
import KarmaTestRunner from '../../src/KarmaTestRunner';
import { expectTestResults } from '../helpers/assertions';

describe('Sample project', () => {

  it('should be able to run karma', async () => {
    const options = new Config();
    options.karmaConfigFile = path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'karma.conf.js');
    const runner = new KarmaTestRunner({ strykerOptions: options, fileNames: [] });
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
      }, {
        name: 'Add this test should fail',
        status: TestStatus.Failed
      }
    ]);
  });
});
