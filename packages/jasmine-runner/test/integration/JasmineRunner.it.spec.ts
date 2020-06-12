import * as path from 'path';

import { SuccessTestResult, MutantRunStatus, KilledMutantRunResult } from '@stryker-mutator/api/test_runner2';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { TestStatus } from '@stryker-mutator/api/test_runner';

import JasmineTestRunner from '../../src/JasmineTestRunner';
import { expectTestResultsToEqual, expectSurvived, expectKilled, expectCompleted, expectErrored } from '../helpers/assertions';

describe('JasmineRunner integration', () => {
  let sut: JasmineTestRunner;

  beforeEach(() => {
    global.__testsInCurrentJasmineRun = [];
  });

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
      expectCompleted(runResult);
      expectTestResultsToEqual(runResult.tests, jasmineInitSuccessResults);
    });

    it('should be able to run twice in short succession', async () => {
      await sut.dryRun();
      const secondRunResult = await sut.dryRun();
      expectCompleted(secondRunResult);
      expectTestResultsToEqual(secondRunResult.tests, jasmineInitSuccessResults);
    });

    it('should be able to filter tests', async () => {
      // Arrange
      const jasmineInitResults = jasmineInitSuccessResults;
      const testFilter = [jasmineInitResults[1].id, jasmineInitResults[3].id];

      // Act
      const runResult = await sut.mutantRun(factory.mutantRunOptions({ testFilter }));

      // Assert
      expectSurvived(runResult);
      expect(global.__testsInCurrentJasmineRun).deep.eq(['spec1', 'spec3']);
    });

    it('should be able to clear the filter after a filtered run', async () => {
      // Arrange
      const jasmineInitResults = jasmineInitSuccessResults;
      const filter1Test = [jasmineInitResults[1].id];
      const filterNoTests = undefined;

      // Act
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: filter1Test }));
      global.__testsInCurrentJasmineRun = [];
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: filterNoTests }));

      // Assert
      expect(global.__testsInCurrentJasmineRun).deep.eq(['spec0', 'spec1', 'spec2', 'spec3', 'spec4']);
    });

    it('should be able to filter tests in quick succession', async () => {
      // Arrange
      const testHooks1 = [jasmineInitSuccessResults[1].id];
      const testHooks2 = [jasmineInitSuccessResults[2].id];

      // Act
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: testHooks1 }));
      const testsRunFirstTime = global.__testsInCurrentJasmineRun;
      global.__testsInCurrentJasmineRun = [];
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: testHooks2 }));
      const testsRunSecondTime = global.__testsInCurrentJasmineRun;

      // Assert
      expect(testsRunFirstTime).deep.eq(['spec1']);
      expect(testsRunSecondTime).deep.eq(['spec2']);
    });
  });

  describe('using a jasmine-project with errors', () => {
    beforeEach(() => {
      process.chdir(path.resolve(__dirname, '../../testResources/errors'));
      sut = new JasmineTestRunner([path.resolve('lib', 'error.js'), path.resolve('spec', 'errorSpec.js')], factory.strykerOptions());
    });

    it('should be able to tell the error', async () => {
      const result = await sut.dryRun();
      expectErrored(result);
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
      expectCompleted(result);
      expectTestResultsToEqual(result.tests, [
        {
          id: 'spec0',
          status: TestStatus.Failed,
          failureMessage: "Expected 'bar' to be 'baz'.",
          name: 'foo should be baz',
        },
      ]);
    });
  });

  describe('when testing mutants', () => {
    beforeEach(() => {
      process.chdir(path.resolve(__dirname, '../../testResources/jasmine-init-mutated'));
      sut = new JasmineTestRunner(resolveJasmineInitFiles(), factory.strykerOptions());
    });

    it('should be able to kill a mutant', async () => {
      const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 1 }) }));
      expectKilled(result);
      expect(result.killedBy).eq('spec0');
      expect(result.failureMessage).eq('Expected undefined to equal Song({  }).');
    });

    it('should be able report "survive" when a mutant is invincible', async () => {
      const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 9 }) }));
      expectSurvived(result);
    });

    it('should be able to kill again after a mutant survived', async () => {
      await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 9 }) }));
      const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 2 }) }));
      const expected: KilledMutantRunResult = { killedBy: 'spec1', status: MutantRunStatus.Killed, failureMessage: 'Expected true to be falsy.' };
      expect(result).deep.eq(expected);
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

const jasmineInitSuccessResults: ReadonlyArray<Omit<SuccessTestResult, 'timeSpentMs'>> = Object.freeze([
  { id: 'spec0', name: jasmineInitResultTestNames[0], status: TestStatus.Success },
  { id: 'spec1', name: jasmineInitResultTestNames[1], status: TestStatus.Success },
  { id: 'spec2', name: jasmineInitResultTestNames[2], status: TestStatus.Success },
  { id: 'spec3', name: jasmineInitResultTestNames[3], status: TestStatus.Success },
  { id: 'spec4', name: jasmineInitResultTestNames[4], status: TestStatus.Success },
]);
