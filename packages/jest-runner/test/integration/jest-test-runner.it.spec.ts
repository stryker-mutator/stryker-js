import path from 'path';
import { platform } from 'os';

import { expect } from 'chai';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { factory, testInjector, assertions } from '@stryker-mutator/test-helpers';
import { CompleteDryRunResult, TestStatus } from '@stryker-mutator/api/test-runner';

import { JestTestRunner, jestTestRunnerFactory } from '../../src/jest-test-runner';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options';
import { JestOptions } from '../../src-generated/jest-runner-options';
import { createJestOptions } from '../helpers/producers';
import { resolveTestResource } from '../helpers/resolve-test-resource';
import { expectTestResults } from '../helpers/assertions';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const paths = require('react-scripts-ts/config/paths');
// It's a bit hacky, but we need to tell create-react-app-ts to pick a different tsconfig.test.json
paths.appTsTestConfig = resolveTestResource('reactTsProject/tsconfig.test.json');

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

  function createSut(overrides?: Partial<JestOptions>) {
    const options: JestRunnerOptionsWithStrykerOptions = factory.strykerWithPluginOptions({
      jest: createJestOptions(overrides),
    });
    return testInjector.injector.provideValue(commonTokens.options, options).injectFunction(jestTestRunnerFactory);
  }

  const expectToHaveSuccessfulTests = (result: CompleteDryRunResult, n: number) => {
    expect(result.tests.filter((t) => t.status === TestStatus.Success)).to.have.length(n);
  };

  describe('dryRun', () => {
    it('should run tests on the example React + TypeScript project', async function () {
      if (platform() === 'win32') {
        console.log("[SKIP] Skipping this test on windows, react ts doesn't work there.");
        this.skip();
      }
      // TODO: Get a proper React TS project that works on Windows
      process.chdir(resolveTestResource('reactTsProject'));
      const jestTestRunner = createSut({ projectType: 'create-react-app-ts' });

      const runResult = await jestTestRunner.dryRun({ coverageAnalysis: 'off' });

      assertions.expectCompleted(runResult);
      expectToHaveSuccessfulTests(runResult, 1);
    });

    it('should set the test name and timeSpentMs', async function () {
      if (platform() === 'win32') {
        console.log("[SKIP] Skipping this test on windows, react ts doesn't work there.");
        this.skip();
      }
      process.chdir(resolveTestResource('reactTsProject'));
      const jestTestRunner = createSut({ projectType: 'create-react-app-ts' });

      const runResult = await jestTestRunner.dryRun({ coverageAnalysis: 'off' });

      assertions.expectCompleted(runResult);
      expect(runResult.tests[0].name).to.equal('renders without crashing');
      expect(runResult.tests[0].timeSpentMs).to.be.above(-1);
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
          startPosition: { column: 2, line: 7 },
        },
        {
          id: 'Add should be able to add one to a number',
          fileName: addSpecFileName,
          startPosition: { column: 2, line: 17 },
        },
        {
          id: 'Add should be able negate a number',
          fileName: addSpecFileName,
          startPosition: { column: 2, line: 26 },
        },
        {
          id: 'Add should be able to recognize a negative number',
          fileName: addSpecFileName,
          startPosition: { column: 2, line: 35 },
        },
        {
          id: 'Circle should have a circumference of 2PI when the radius is 1',
          fileName: circleSpecFileName,
          startPosition: { column: 2, line: 4 },
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
        activeMutant: factory.mutant({
          id: 1,
        }),
        sandboxFileName: require.resolve(path.resolve(exampleProjectRoot, 'src', 'Add.js')),
      });
      mutantRunOptions.activeMutant.id = 1;

      const runResult = await jestTestRunner.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.killedBy).eq('Add should be able to add two numbers');
      expect(runResult.failureMessage).contains('Expected: 7').contains('Received: -3');
    });

    it('should let mutant 11 survive', async () => {
      const exampleProjectRoot = resolveTestResource('jasmine2-node-instrumented');
      process.chdir(resolveTestResource('jasmine2-node-instrumented'));
      const jestTestRunner = createSut();
      const mutantRunOptions = factory.mutantRunOptions({
        sandboxFileName: require.resolve(path.resolve(exampleProjectRoot, 'src', 'Circle.js')),
      });
      mutantRunOptions.activeMutant.id = 11;

      const runResult = await jestTestRunner.mutantRun(mutantRunOptions);

      assertions.expectSurvived(runResult);
    });

    it('should be able to let a mutant survive after killing mutant 1', async () => {
      // Arrange
      const exampleProjectRoot = resolveTestResource('jasmine2-node-instrumented');
      process.chdir(resolveTestResource('jasmine2-node-instrumented'));
      const jestTestRunner = createSut();
      const mutantRunOptions = factory.mutantRunOptions({
        sandboxFileName: require.resolve(path.resolve(exampleProjectRoot, 'src', 'Add.js')),
      });
      mutantRunOptions.activeMutant.id = 1;

      // Act
      const firstResult = await jestTestRunner.mutantRun(mutantRunOptions);
      mutantRunOptions.activeMutant.id = 10;
      const secondResult = await jestTestRunner.mutantRun(mutantRunOptions);

      // Assert
      assertions.expectKilled(firstResult);
      assertions.expectSurvived(secondResult);
    });
  });
});
