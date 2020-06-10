import * as path from 'path';

import { RunStatus, TestResult } from '@stryker-mutator/api/test_runner2';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { TestStatus } from '@stryker-mutator/api/test_runner';

import JasmineTestRunner from '../../src/JasmineTestRunner';
import { expectTestResultsToEqual } from '../helpers/assertions';

describe('JasmineRunner integration', () => {
  let sut: JasmineTestRunner;
  afterEach(() => {
    process.chdir(path.resolve(__dirname, '../../..'));
  });

  describe('using the jasmine-init project', () => {
    beforeEach(() => {
      process.chdir(path.resolve(__dirname, '../../testResources/jasmine-init'));
      sut = new JasmineTestRunner(resolveJasmineInitFiles(), factory.strykerOptions({ jasmineConfigFile: 'spec/support/jasmine.json' }));
    });
    it('should run the specs', async () => {
      const runResult = await sut.dryRun();
      expect(runResult.status).eq(RunStatus.Complete);
      expectTestResultsToEqual(runResult.tests, createJasmineInitResults());
    });

    it('should be able to run twice in short succession', async () => {
      await sut.dryRun();
      const secondRunResult = await sut.dryRun();
      expect(secondRunResult.status).eq(RunStatus.Complete);
      expectTestResultsToEqual(secondRunResult.tests, createJasmineInitResults());
    });

    it('should be able to filter tests', async () => {
      // Arrange
      const jasmineInitResults = createJasmineInitResults();
      const testFilter = [factory.testSelection({ name: jasmineInitResults[1].name }), factory.testSelection({ name: jasmineInitResults[3].name })];

      // Act
      const runResult = await sut.mutantRun(factory.mutantRunOptions({ testFilter }));

      // Assert
      expect(runResult.status).eq(RunStatus.Complete);
      expectTestsFiltered(runResult.tests, 1, 3);
    });

    it('should be able to clear the filter after a filtered run', async () => {
      const jasmineInitResults = createJasmineInitResults();
      const filter1Test = [factory.testSelection({ name: jasmineInitResults[1].name })];
      const filterNoTests = undefined;

      await sut.mutantRun(factory.mutantRunOptions({ testFilter: filter1Test }));
      const actualResult = await sut.mutantRun(factory.mutantRunOptions({ testFilter: filterNoTests }));
      expectTestResultsToEqual(actualResult.tests, jasmineInitResults);
    });

    it('should be able to filter tests in quick succession', async () => {
      // Arrange
      const jasmineInitResults = createJasmineInitResults();
      const testHooks1 = [factory.testSelection({ name: jasmineInitResults[1].name })];
      const testHooks2 = [factory.testSelection({ name: jasmineInitResults[2].name })];

      // Act
      const firstResult = await sut.mutantRun(factory.mutantRunOptions({ testFilter: testHooks1 }));
      const secondResult = await sut.mutantRun(factory.mutantRunOptions({ testFilter: testHooks2 }));

      // Assert
      expectTestsFiltered(firstResult.tests, 1);
      expectTestsFiltered(secondResult.tests, 2);
    });

    function expectTestsFiltered(actualTestResults: TestResult[], ...filteredTestIds: number[]) {
      expectTestResultsToEqual(
        actualTestResults,
        createJasmineInitResults().map((testResult, id) => ({
          failureMessage: testResult.failureMessage,
          name: testResult.name,
          status: filteredTestIds.includes(id) ? TestStatus.Success : TestStatus.Skipped,
        }))
      );
    }
  });

  describe('using a jasmine-project with errors', () => {
    beforeEach(() => {
      process.chdir(path.resolve(__dirname, '../../testResources/errors'));
      sut = new JasmineTestRunner([path.resolve('lib', 'error.js'), path.resolve('spec', 'errorSpec.js')], factory.strykerOptions());
    });

    it('should be able to tell the error', async () => {
      const result = await sut.dryRun();
      expect(result.status).eq(RunStatus.Error);
      expect(result.errorMessage)
        .matches(/^An error occurred while loading your jasmine specs.*/)
        .matches(/.*SyntaxError: Unexpected identifier.*/);
    });
  });

  describe('when it includes failed tests', () => {
    beforeEach(() => {
      process.chdir(path.resolve(__dirname, '../../testResources/test-failures'));
      sut = new JasmineTestRunner([path.resolve('lib', 'foo.js'), path.resolve('spec', 'fooSpec.js')], factory.strykerOptions());
    });

    it('should complete with one test failure', async () => {
      const result = await sut.dryRun();
      expect(result.status).eq(RunStatus.Complete);
      expectTestResultsToEqual(result.tests, [
        {
          failureMessage: "Expected 'bar' to be 'baz'.",
          name: 'foo should be baz',
          status: TestStatus.Failed,
        },
      ]);
    });
  });

  describe('when testing mutants', () => {
    beforeEach(() => {
      process.chdir(path.resolve(__dirname, '../../testResources/jasmine-init-mutated'));
      sut = new JasmineTestRunner(resolveJasmineInitFiles(), factory.strykerOptions());
    });

    it('should be able to fail when a mutant is killed', async () => {
      const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 1 }) }));
      expectTestResultsToEqual(
        result.tests,
        createJasmineInitResults([{ status: TestStatus.Failed, failureMessage: 'Expected undefined to equal Song({  }).' }])
      );
    });

    it('should be able to succeed when a mutant is survives', async () => {
      const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 9 }) }));
      expectTestResultsToEqual(result.tests, createJasmineInitResults());
    });

    it('should be able to fail after succeeding', async () => {
      await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 9 }) }));
      const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 2 }) }));
      expectTestResultsToEqual(
        result.tests,
        createJasmineInitResults([{ status: TestStatus.Success }, { status: TestStatus.Failed, failureMessage: 'Expected true to be falsy.' }])
      );
    });
  });
});

function resolveJasmineInitFiles(): readonly string[] {
  return [
    path.resolve('lib', 'jasmine_examples', 'Player.js'),
    path.resolve('lib', 'jasmine_examples', 'Song.js'),
    path.resolve('spec', 'helpers', 'jasmine_examples', 'SpecHelper.js'),
    path.resolve('spec', 'jasmine_examples', 'PlayerSpec.js'),
  ];
}

const jasmineInitResultTestNames = Object.freeze([
  'Player should be able to play a Song',
  'Player when song has been paused should indicate that the song is currently paused',
  'Player when song has been paused should be possible to resume',
  'Player tells the current song if the user has made it a favorite',
  'Player #resume should throw an exception if song is already playing',
]);

function createJasmineInitResults(
  overrides: Array<Omit<TestResult, 'timeSpentMs' | 'name'>> = [
    { status: TestStatus.Success },
    { status: TestStatus.Success },
    { status: TestStatus.Success },
    { status: TestStatus.Success },
    { status: TestStatus.Success },
  ]
): Array<Omit<TestResult, 'timeSpentMs'>> {
  return overrides.map(({ status, failureMessage }, index) => ({
    name: jasmineInitResultTestNames[index],
    status,
    failureMessage,
  }));
}
