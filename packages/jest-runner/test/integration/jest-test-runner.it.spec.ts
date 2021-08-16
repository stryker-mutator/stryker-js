import path from 'path';

import { expect } from 'chai';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { factory, testInjector, assertions } from '@stryker-mutator/test-helpers';
import { CompleteDryRunResult, TestStatus } from '@stryker-mutator/api/test-runner';

import { StrykerOptions } from '@stryker-mutator/api/core';

import { JestTestRunner, jestTestRunnerFactory } from '../../src/jest-test-runner';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options';
import { JestOptions } from '../../src-generated/jest-runner-options';
import { createJestOptions } from '../helpers/producers';
import { resolveTestResource } from '../helpers/resolve-test-resource';
import { expectTestResults } from '../helpers/assertions';

// Needed for Jest in order to run tests
process.env.BABEL_ENV = 'test';

describe(`${JestTestRunner.name} integration test`, () => {
  // Names of the tests in the example projects
  const testNames = Object.freeze([
    'Add should be able to add two numbers',
    'Add should be able to add one to a number',
    'Add should be able negate a number',
    'Add should be able to recognize a negative number',
    'Circle should have a circumference of 2PI when the radius is 1',
  ]);

  function createSut(jestOverrides?: Partial<JestOptions>, strykerOverrides?: Partial<StrykerOptions>) {
    const options: JestRunnerOptionsWithStrykerOptions = factory.strykerWithPluginOptions({
      jest: createJestOptions(jestOverrides),
      ...strykerOverrides,
    });
    return testInjector.injector.provideValue(commonTokens.options, options).injectFunction(jestTestRunnerFactory);
  }

  const expectToHaveSuccessfulTests = (result: CompleteDryRunResult, n: number) => {
    expect(result.tests.filter((t) => t.status === TestStatus.Success)).to.have.length(n);
  };

  describe('dryRun', () => {
    it('should set the test name and timeSpentMs', async function () {
      process.chdir(resolveTestResource('jasmine2-node'));
      const jestTestRunner = createSut();

      const runResult = await jestTestRunner.dryRun({ coverageAnalysis: 'off' });

      assertions.expectCompleted(runResult);
      const result = runResult.tests.find((test) => test.id === 'Add should be able to add two numbers');
      expect(result).to.not.be.null;
      expect(result!.name).to.equal('Add should be able to add two numbers');
      expect(result!.timeSpentMs).to.be.above(-1);
    });

    it('should run tests on the example custom project using package.json', async () => {
      process.chdir(resolveTestResource('jasmine2-node'));
      const jestTestRunner = createSut();

      const runResult = await jestTestRunner.dryRun({ coverageAnalysis: 'off' });

      assertions.expectCompleted(runResult);
      expectToHaveSuccessfulTests(runResult, testNames.length);
    });

    it('should run tests on the example custom project using jest.config.js', async () => {
      process.chdir(resolveTestResource('exampleProjectWithExplicitJestConfig'));

      const jestTestRunner = createSut();

      const runResult = await jestTestRunner.dryRun({ coverageAnalysis: 'off' });

      assertions.expectCompleted(runResult);
      expectToHaveSuccessfulTests(runResult, testNames.length);
    });

    it('should report the test positions and file names', async () => {
      process.chdir(resolveTestResource('exampleProjectWithExplicitJestConfig'));
      const addSpecFileName = resolveTestResource('exampleProjectWithExplicitJestConfig', 'src', '__tests__', 'AddSpec.js');
      const circleSpecFileName = resolveTestResource('exampleProjectWithExplicitJestConfig', 'src', '__tests__', 'CircleSpec.js');
      const jestTestRunner = createSut();
      const runResult = await jestTestRunner.dryRun({ coverageAnalysis: 'perTest' });
      assertions.expectCompleted(runResult);
      expectTestResults(runResult, [
        {
          id: 'Add should be able to add two numbers',
          fileName: addSpecFileName,
          startPosition: { column: 2, line: 6 },
        },
        {
          id: 'Add should be able to add one to a number',
          fileName: addSpecFileName,
          startPosition: { column: 2, line: 16 },
        },
        {
          id: 'Add should be able negate a number',
          fileName: addSpecFileName,
          startPosition: { column: 2, line: 25 },
        },
        {
          id: 'Add should be able to recognize a negative number',
          fileName: addSpecFileName,
          startPosition: { column: 2, line: 34 },
        },
        {
          id: 'Circle should have a circumference of 2PI when the radius is 1',
          fileName: circleSpecFileName,
          startPosition: { column: 2, line: 3 },
        },
      ]);
    });
  });

  describe('mutantRun', () => {
    it('should kill mutant 1', async () => {
      const exampleProjectRoot = resolveTestResource('jasmine2-node-instrumented');
      process.chdir(exampleProjectRoot);
      const jestTestRunner = createSut();
      const mutantRunOptions = factory.mutantRunOptions({
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: require.resolve(path.resolve(exampleProjectRoot, 'src', 'Add.js')),
      });
      mutantRunOptions.activeMutant.id = '1';

      const runResult = await jestTestRunner.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq(['Add should be able to add two numbers']);
      expect(runResult.failureMessage).contains('Expected: 7').contains('Received: -3');
    });

    it('should let mutant 11 survive', async () => {
      const exampleProjectRoot = resolveTestResource('jasmine2-node-instrumented');
      process.chdir(resolveTestResource('jasmine2-node-instrumented'));
      const jestTestRunner = createSut();
      const mutantRunOptions = factory.mutantRunOptions({
        sandboxFileName: require.resolve(path.resolve(exampleProjectRoot, 'src', 'Circle.js')),
      });
      mutantRunOptions.activeMutant.id = '11';

      const runResult = await jestTestRunner.mutantRun(mutantRunOptions);

      assertions.expectSurvived(runResult);
    });

    it('should be able to let a mutant survive after killing mutant 1', async () => {
      // Arrange
      const exampleProjectRoot = resolveTestResource('jasmine2-node-instrumented');
      process.chdir(exampleProjectRoot);
      const jestTestRunner = createSut();
      const mutantRunOptions = factory.mutantRunOptions({
        sandboxFileName: require.resolve(path.resolve(exampleProjectRoot, 'src', 'Add.js')),
      });
      mutantRunOptions.activeMutant.id = '1';

      // Act
      const firstResult = await jestTestRunner.mutantRun(mutantRunOptions);
      mutantRunOptions.activeMutant.id = '10';
      const secondResult = await jestTestRunner.mutantRun(mutantRunOptions);

      // Assert
      assertions.expectKilled(firstResult);
      assertions.expectSurvived(secondResult);
    });

    it('should be able to collect all tests that kill a mutant when disableBail = true', async () => {
      // Arrange
      const exampleProjectRoot = resolveTestResource('jasmine2-node-no-mocks-instrumented');
      process.chdir(exampleProjectRoot);
      const jestTestRunner = createSut({}, { disableBail: true });
      const mutantRunOptions = factory.mutantRunOptions({
        sandboxFileName: require.resolve(path.resolve(exampleProjectRoot, 'src', 'Add.js')),
      });
      mutantRunOptions.activeMutant.id = '1';

      // Act
      const result = await jestTestRunner.mutantRun(mutantRunOptions);

      // Assert
      assertions.expectKilled(result);
      expect((result.killedBy as string[]).sort((a, b) => (a > b ? 1 : -1))).deep.eq([
        'Add should be able to add two numbers',
        'Multiply should be able to multiply two numbers',
      ]);
    });
  });
});
