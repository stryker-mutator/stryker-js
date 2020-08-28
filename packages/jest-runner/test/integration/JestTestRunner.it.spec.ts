import * as path from 'path';

import { expect } from 'chai';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { factory, testInjector, assertions } from '@stryker-mutator/test-helpers';
import { CompleteDryRunResult, TestStatus } from '@stryker-mutator/api/test_runner';

import JestTestRunner, { jestTestRunnerFactory } from '../../src/JestTestRunner';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/JestRunnerOptionsWithStrykerOptions';
import { JestOptions } from '../../src-generated/jest-runner-options';
import { createJestOptions } from '../helpers/producers';

const paths = require('react-scripts-ts/config/paths');
// It's a bit hacky, but we need to tell create-react-app-ts to pick a different tsconfig.test.json
paths.appTsTestConfig = require.resolve('../../testResources/reactTsProject/tsconfig.test.json');

// Get the actual project root, since we will stub process.cwd later on
const jestProjectRoot = process.cwd();

// Needed for Jest in order to run tests
process.env.BABEL_ENV = 'test';

describe(`${JestTestRunner.name} integration test`, () => {
  const initialCwd = process.cwd();

  // Names of the tests in the example projects
  const testNames = [
    'Add should be able to add two numbers',
    'Add should be able to add one to a number',
    'Add should be able negate a number',
    'Add should be able to recognize a negative number',
    'Add should be able to recognize that 0 is not a negative number',
    'Circle should have a circumference of 2PI when the radius is 1',
  ];

  afterEach(() => {
    process.chdir(initialCwd);
  });

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
    it('should run tests on the example React + TypeScript project', async () => {
      // TODO: Get a proper React TS project that works on Windows
      process.chdir(getProjectRoot('reactTsProject'));
      const jestTestRunner = createSut({ projectType: 'create-react-app-ts' });

      const runResult = await jestTestRunner.dryRun();

      assertions.expectCompleted(runResult);
      expectToHaveSuccessfulTests(runResult, 1);
    });

    it('should set the test name and timeSpentMs', async () => {
      process.chdir(getProjectRoot('reactTsProject'));
      const jestTestRunner = createSut({ projectType: 'create-react-app-ts' });

      const runResult = await jestTestRunner.dryRun();

      assertions.expectCompleted(runResult);
      expect(runResult.tests[0].name).to.equal('renders without crashing');
      expect(runResult.tests[0].timeSpentMs).to.be.above(-1);
    });

    it('should run tests on the example custom project using package.json', async () => {
      process.chdir(getProjectRoot('exampleProject'));
      const jestTestRunner = createSut();

      const runResult = await jestTestRunner.dryRun();

      assertions.expectCompleted(runResult);
      expectToHaveSuccessfulTests(runResult, testNames.length);
    });

    it('should run tests on the example custom project using jest.config.js', async () => {
      process.chdir(getProjectRoot('exampleProjectWithExplicitJestConfig'));

      const jestTestRunner = createSut();

      const runResult = await jestTestRunner.dryRun();

      assertions.expectCompleted(runResult);
      expectToHaveSuccessfulTests(runResult, testNames.length);
    });
  });

  describe('mutantRun', () => {
    it('should kill mutant 1', async () => {
      const exampleProjectRoot = getProjectRoot('exampleProject');
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
      const exampleProjectRoot = getProjectRoot('exampleProject');
      process.chdir(getProjectRoot('exampleProject'));
      const jestTestRunner = createSut();
      const mutantRunOptions = factory.mutantRunOptions({
        sandboxFileName: require.resolve(path.resolve(exampleProjectRoot, 'src', 'Circle.js')),
      });
      mutantRunOptions.activeMutant.id = 11;

      const runResult = await jestTestRunner.mutantRun(mutantRunOptions);

      assertions.expectSurvived(runResult);
    });
  });
});

function getProjectRoot(testResource: string) {
  return path.join(jestProjectRoot, 'testResources', testResource);
}
