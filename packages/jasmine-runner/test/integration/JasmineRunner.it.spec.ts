import * as path from 'path';
import { expect } from 'chai';
import JasmineTestRunner from '../../src/JasmineTestRunner';
import { TestResult, TestStatus, RunStatus } from '@stryker-mutator/api/test_runner';
import JasmineTestFramework from '@stryker-mutator/jasmine-framework/src/JasmineTestFramework';
import { expectTestResultsToEqual } from '../helpers/assertions';
import { factory } from '@stryker-mutator/test-helpers';

function wrapInClosure(codeFragment: string) {
  return `
    (function (window) {
      ${codeFragment}
    })((Function('return this'))());`;
}

describe('JasmineRunner integration', () => {

  let sut: JasmineTestRunner;
  afterEach(() => {
    process.chdir(path.resolve(__dirname, '../../..'));
  });

  describe('using the jasmine-init project', () => {

    const expectedJasmineInitResults = Object.freeze([Object.freeze({
      failureMessages: undefined,
      name: 'Player should be able to play a Song',
      status: TestStatus.Success
    }), Object.freeze({
      failureMessages: undefined,
      name: 'Player when song has been paused should indicate that the song is currently paused',
      status: TestStatus.Success
    }), Object.freeze({
      failureMessages: undefined,
      name: 'Player when song has been paused should be possible to resume',
      status: TestStatus.Success
    }), Object.freeze({
      failureMessages: undefined,
      name: 'Player tells the current song if the user has made it a favorite',
      status: TestStatus.Success
    }), Object.freeze({
      failureMessages: undefined,
      name: 'Player #resume should throw an exception if song is already playing',
      status: TestStatus.Success
    })]);

    beforeEach(() => {
      process.chdir(path.resolve(__dirname, '../../testResources/jasmine-init'));
      sut = new JasmineTestRunner([
          path.resolve('lib', 'jasmine_examples', 'Player.js'),
          path.resolve('lib', 'jasmine_examples', 'Song.js'),
          path.resolve('spec', 'helpers', 'jasmine_examples', 'SpecHelper.js'),
          path.resolve('spec', 'jasmine_examples', 'PlayerSpec.js')
        ], factory.STRYKER_OPTIONS({ jasmineConfigFile: 'spec/support/jasmine.json' }));
    });
    it('should run the specs', async () => {
      const runResult = await sut.run({});
      expect(runResult.status).eq(RunStatus.Complete);
      expectTestResultsToEqual(runResult.tests, expectedJasmineInitResults);
    });

    it('should be able to run twice in short succession', async () => {
      await sut.run({});
      const secondRunResult = await sut.run({});
      expect(secondRunResult.status).eq(RunStatus.Complete);
      expectTestResultsToEqual(secondRunResult.tests, expectedJasmineInitResults);
    });

    it('should be able to filter tests', async () => {
      // Arrange
      const testFramework = new JasmineTestFramework();
      const testHooks = wrapInClosure(testFramework.filter([{
        id: 1,
        name: expectedJasmineInitResults[1].name
      }, {
        id: 3,
        name: expectedJasmineInitResults[3].name
      }]));

      // Act
      const runResult = await sut.run({ testHooks });

      // Assert
      expect(runResult.status).eq(RunStatus.Complete);
      expectTestsFiltered(runResult.tests, 1, 3);
    });

    it('should be able to filter tests in quick succession', async () => {
      // Arrange
      const testFramework = new JasmineTestFramework();
      const testHooks1 = wrapInClosure(testFramework.filter([{
        id: 1,
        name: expectedJasmineInitResults[1].name
      }]));
      const testHooks2 = wrapInClosure(testFramework.filter([{
        id: 2,
        name: expectedJasmineInitResults[2].name
      }]));

      // Act
      const firstResult = await sut.run({ testHooks: testHooks1 });
      const secondResult = await sut.run({ testHooks: testHooks2 });

      // Assert
      expectTestsFiltered(firstResult.tests, 1);
      expectTestsFiltered(secondResult.tests, 2);
    });

    function expectTestsFiltered(actualTestResults: TestResult[], ...filteredTestIds: number[]) {
      expectTestResultsToEqual(actualTestResults, expectedJasmineInitResults.map((testResult, id) => ({
        failureMessages: testResult.failureMessages,
        name: testResult.name,
        status: filteredTestIds.indexOf(id) >= 0 ? TestStatus.Success : TestStatus.Skipped
      })));
    }
  });

  describe('using a jasmine-project with errors', () => {

    beforeEach(() => {
      process.chdir(path.resolve(__dirname, '../../testResources/errors'));
      sut = new JasmineTestRunner([path.resolve('lib', 'error.js'), path.resolve('spec', 'errorSpec.js')], factory.STRYKER_OPTIONS());
    });

    it('should be able to tell the error', async () => {
      const result = await sut.run({});
      expect(result.status).eq(RunStatus.Error);
      expect(result.errorMessages).lengthOf(1);
      const actualError: string = (result.errorMessages as string[])[0];
      expect(actualError)
        .matches(/^An error occurred while loading your jasmine specs.*/)
        .matches(/.*SyntaxError: Unexpected identifier.*/);
    });
  });

  describe('when it includes failed tests', () => {
    beforeEach(() => {
      process.chdir(path.resolve(__dirname, '../../testResources/test-failures'));
      sut = new JasmineTestRunner([
          path.resolve('lib', 'foo.js'),
          path.resolve('spec', 'fooSpec.js')
        ], factory.STRYKER_OPTIONS());
    });

    it('should complete with one test failure', async () => {
      const result = await sut.run({});
      expect(result.status).eq(RunStatus.Complete);
      expectTestResultsToEqual(result.tests, [{
        failureMessages: ['Expected \'bar\' to be \'baz\'.'],
        name: 'foo should be baz',
        status: TestStatus.Failed
      }]);
    });
  });
});
