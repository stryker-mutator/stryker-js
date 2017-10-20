import * as path from 'path';
import { expect } from 'chai';
import { RunStatus } from 'stryker-api/test_runner';
import MochaTestRunner from '../../src/MochaTestRunner';
import { runnerOptions, fileDescriptor } from '../helpers/mockHelpers';
import MochaRunnerOptions from '../../src/MochaRunnerOptions';

describe('QUnit sample', function () {
  this.timeout(10000);

  it('should work when configured with "qunit" ui', async () => {
    const mochaOptions: MochaRunnerOptions = {
      require: [],
      ui: 'qunit'
    };
    const sut = new MochaTestRunner(runnerOptions({
      files: [
        fileDescriptor({ name: resolve('./testResources/qunit-sample/src/MyMath.js'), included: false, mutated: true }),
        fileDescriptor({ name: resolve('./testResources/qunit-sample/test/MyMathSpec.js'), included: true, mutated: false }),
      ],
      strykerOptions: { mochaOptions }
    }));
    const actualResult = await sut.run();
    expect(actualResult.status).eq(RunStatus.Complete);
    expect(actualResult.tests.map(t => t.name)).deep.eq([
      'Math should be able to add two numbers',
      'Math should be able 1 to a number',
      'Math should be able negate a number',
      'Math should be able to recognize a negative number',
      'Math should be able to recognize that 0 is not a negative number'
    ]);
  });

  it('should not run tests when not configured with "qunit" ui', async () => {
    const sut = new MochaTestRunner(runnerOptions({
      files: [
        fileDescriptor({ name: resolve('./testResources/qunit-sample/src/MyMath.js'), included: false, mutated: true }),
        fileDescriptor({ name: resolve('./testResources/qunit-sample/test/MyMathSpec.js'), included: true, mutated: false }),
      ]
    }));
    const actualResult = await sut.run();
    expect(actualResult.status).eq(RunStatus.Complete);
    expect(actualResult.tests).lengthOf(0);
  });
});

function resolve(fileName: string) {
  return path.resolve(__dirname, '..', '..', fileName);
}