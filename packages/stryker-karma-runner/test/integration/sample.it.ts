import { TestStatus } from 'stryker-api/test_runner';
import { Config } from 'stryker-api/config';
import KarmaConfigEditor from '../../src/KarmaConfigEditor';
import * as path from 'path';
import KarmaTestRunner from '../../src/KarmaTestRunner';
import { expect } from 'chai';

describe('Sample project', function () {
  this.timeout(20000);

  it('should be able to run karma', async () => {
    const options = new Config();
    options.karmaConfigFile = path.resolve(__dirname, '..', '..', 'testResources', 'sampleProject', 'karma.conf.js');
    new KarmaConfigEditor().edit(options);
    const runner = new KarmaTestRunner({ port: 9892, strykerOptions: options, fileNames: [] });
    await runner.init();
    const result = await runner.run({});

    console.log(result.tests);

    expect(result.tests.map(test => ({ name: test.name, status: test.status }))).deep.eq(
      [
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
      ]

    );
  });
});