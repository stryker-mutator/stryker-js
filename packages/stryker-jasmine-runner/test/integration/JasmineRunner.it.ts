import * as path from 'path';
import { expect } from 'chai';
import JasmineTestRunner from '../../src/JasmineTestRunner';
import { TestResult, TestStatus } from 'stryker-api/test_runner';

describe('JasmineRunner integration', () => {

  let sut: JasmineTestRunner;
  afterEach(() => {
    process.chdir(path.resolve(__dirname, '../../..'));
  });

  describe('using the jasmine-init project', () => {

    const expectedJasmineInitResults = Object.freeze([Object.freeze({
      name: 'Player should be able to play a Song',
      status: TestStatus.Success
    }), Object.freeze({
      name: 'Player when song has been paused should indicate that the song is currently paused',
      status: TestStatus.Success
    }), Object.freeze({
      name: 'Player when song has been paused should be possible to resume',
      status: TestStatus.Success
    }), Object.freeze({
      name: 'Player tells the current song if the user has made it a favorite',
      status: TestStatus.Success
    }), Object.freeze({
      name: 'Player #resume should throw an exception if song is already playing',
      status: TestStatus.Success
    })]);

    beforeEach(() => {
      process.chdir(path.resolve(__dirname, '../../testResources/jasmine-init'));
      sut = new JasmineTestRunner({
        fileNames: [
          path.resolve('lib', 'jasmine_examples', 'Player.js'),
          path.resolve('lib', 'jasmine_examples', 'Song.js'),
          path.resolve('spec', 'helpers', 'jasmine_examples', 'SpecHelper.js'),
          path.resolve('spec', 'jasmine_examples', 'PlayerSpec.js')
        ], strykerOptions: { jasmineConfigFile: 'spec/support/jasmine.json' }
      });
    });
    it('should run the specs', async () => {
      const runResult = await sut.run({});
      expectTestResultsToEqual(runResult.tests, expectedJasmineInitResults);
    });

    it('should be able to run twice in short succession', async () => {
      await sut.run({});
      const secondRunResult = await sut.run({});
      expectTestResultsToEqual(secondRunResult.tests, expectedJasmineInitResults);
    });
  });

  function expectTestResultsToEqual(actualTestResults: TestResult[], expectedResults: ReadonlyArray<{ name: string, status: TestStatus }>) {
    expect(actualTestResults).lengthOf(expectedResults.length, `Expected ${JSON.stringify(actualTestResults, null, 2)} to equal ${JSON.stringify(expectedResults, null, 2)}`);
    expectedResults.forEach(expectedResult => {
      const actualTestResult = actualTestResults.find(testResult => testResult.name === expectedResult.name);
      if (actualTestResult) {
        expect({ name: actualTestResult.name, status: actualTestResult.status }).deep.equal(expectedResult);
      } else {
        expect.fail(undefined, undefined, `Could not find test result "${expectedResult.name}" in ${JSON.stringify(actualTestResults.map(_ => _.name))}`);
      }
    });
  }
});