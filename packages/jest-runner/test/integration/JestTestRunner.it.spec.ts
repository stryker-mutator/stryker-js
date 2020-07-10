import * as path from 'path';

import { expect } from 'chai';
import * as sinon from 'sinon';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { factory, testInjector, assertions } from '@stryker-mutator/test-helpers';
import { CompleteDryRunResult, TestStatus, DryRunOptions, MutantRunStatus } from '@stryker-mutator/api/test_runner2';

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
  // Set timeout for integration tests to 10 seconds for travis
  let processCwdStub: sinon.SinonStub;

  // Names of the tests in the example projects
  const testNames = [
    'Add should be able to add two numbers',
    'Add should be able to add one to a number',
    'Add should be able negate a number',
    'Add should be able to recognize a negative number',
    'Add should be able to recognize that 0 is not a negative number',
    'Circle should have a circumference of 2PI when the radius is 1',
  ];

  beforeEach(() => {
    processCwdStub = sinon.stub(process, 'cwd');
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
  // const expectToHaveFailedTests = (result: CompleteDryRunResult, expectedFailureMessages: string[]) => {
  //   const actualFailedTests = result.tests.filter(isFailed);
  //   expect(actualFailedTests).to.have.length(expectedFailureMessages.length);
  //   actualFailedTests.forEach((failedTest) => {
  //     const actualFailedMessage = failedTest.failureMessage.split('\n')[0];
  //     expect(actualFailedMessage).to.be.oneOf(expectedFailureMessages);
  //   });
  // };

  // function isFailed(t: TestResult): t is FailedTestResult {
  //   return t.status === TestStatus.Failed;
  // }

  describe('dryRun', () => {
    const runOptions: DryRunOptions = { timeout: 0, coverageAnalysis: 'off' };

    it.skip('should run tests on the example React + TypeScript project', async () => {
      // TODO: Get a proper React TS project that works on Windows
      processCwdStub.returns(getProjectRoot('reactTsProject'));
      const jestTestRunner = createSut({ projectType: 'react-ts' });

      const runResult = await jestTestRunner.dryRun(runOptions);

      assertions.expectCompleted(runResult);
      expectToHaveSuccessfulTests(runResult, 1);
    });

    it.skip('should set the test name and timeSpentMs', async () => {
      processCwdStub.returns(getProjectRoot('reactTsProject'));
      const jestTestRunner = createSut({ projectType: 'react-ts' });

      const runResult = await jestTestRunner.dryRun(runOptions);

      assertions.expectCompleted(runResult);
      expect(runResult.tests[0].name).to.equal('renders without crashing');
      expect(runResult.tests[0].timeSpentMs).to.be.above(-1);
    });

    it('should run tests on the example custom project using package.json', async () => {
      processCwdStub.returns(getProjectRoot('exampleProject'));
      const jestTestRunner = createSut();

      const runResult = await jestTestRunner.dryRun(runOptions);

      assertions.expectCompleted(runResult);
      expectToHaveSuccessfulTests(runResult, testNames.length);
    });

    it('should run tests on the example custom project using jest.config.js', async () => {
      processCwdStub.returns(getProjectRoot('exampleProjectWithExplicitJestConfig'));

      const jestTestRunner = createSut();

      const runResult = await jestTestRunner.dryRun(runOptions);

      assertions.expectCompleted(runResult);
      expectToHaveSuccessfulTests(runResult, testNames.length);
    });
  });

  describe('mutantRun', () => {
    it.only('should kill mutant 1', async () => {
      processCwdStub.returns(getProjectRoot('exampleProject'));
      const jestTestRunner = createSut();
      const mutantRunOptions = factory.mutantRunOptions();
      mutantRunOptions.activeMutant.id = 1;

      const runResult = await jestTestRunner.mutantRun(mutantRunOptions);

      expect(runResult.status).to.eq(MutantRunStatus.Killed);
    });

    it('should let mutant 11 survive', async () => {
      processCwdStub.returns(getProjectRoot('exampleProject'));
      const jestTestRunner = createSut();
      const mutantRunOptions = factory.mutantRunOptions();
      mutantRunOptions.activeMutant.id = 11;

      const runResult = await jestTestRunner.mutantRun(mutantRunOptions);

      expect(runResult.status).to.eq(MutantRunStatus.Survived);
    });
  });
});

function getProjectRoot(testResource: string) {
  return path.join(jestProjectRoot, 'testResources', testResource);
}
