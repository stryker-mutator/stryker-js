import { Config } from 'stryker-api/config';
import { RunnerOptions, RunStatus, TestStatus, RunOptions } from 'stryker-api/test_runner';
import * as sinon from 'sinon';
import { expect } from 'chai';
import * as path from 'path';

// It's a bit hacky, but we need to tell create-react-app-ts to pick a different tsconfig.test.json
const paths = require('react-scripts-ts/config/paths');
paths.appTsTestConfig = require.resolve('../../testResources/reactTsProject/tsconfig.test.json');

import JestConfigEditor from '../../src/JestConfigEditor';
import JestTestRunner from '../../src/JestTestRunner';
import { TestRunnerSettings } from 'stryker-api/core';

// Get the actual project root, since we will stub process.cwd later on
const jestProjectRoot = process.cwd();

// Needed for Jest in order to run tests
process.env.BABEL_ENV = 'test';

describe('Integration test for Strykers Jest runner', () => {
  // Set timeout for integration tests to 10 seconds for travis

  let jestConfigEditor: JestConfigEditor;
  let runnerOptions: RunnerOptions;
  let processCwdStub: sinon.SinonStub;
  let strykerOptions: Config;

  const runOptions: RunOptions = { timeout: 0 };

  // Names of the tests in the example projects
  const testNames = [
    'Add should be able to add two numbers',
    'Add should be able to add one to a number',
    'Add should be able negate a number',
    'Add should be able to recognize a negative number',
    'Add should be able to recognize that 0 is not a negative number',
    'Circle should have a circumference of 2PI when the radius is 1'
  ];

  beforeEach(() => {
    processCwdStub = sinon.stub(process, 'cwd');

    jestConfigEditor = new JestConfigEditor();
    strykerOptions = new Config();

    runnerOptions = {
      fileNames: [],
      port: 0,
      settings: {}
    };
  });

  it('should run tests on the example React + TypeScript project', async () => {
    processCwdStub.returns(getProjectRoot('reactTsProject'));
    strykerOptions.set({ testRunner: { name: 'jest', settings: { projectType: 'react-ts' } } });
    jestConfigEditor.edit(strykerOptions);

    runnerOptions.settings = strykerOptions.testRunner.settings as TestRunnerSettings;

    const jestTestRunner = new JestTestRunner(runnerOptions);
    const result = await jestTestRunner.run(runOptions);

    expect(result.status).to.equal(RunStatus.Complete);
    expect(result).to.have.property('tests');
    expect(result.tests).to.be.an('array').that.is.not.empty;
    expect(result.tests[0].name).to.equal('renders without crashing');
    expect(result.tests[0].status).to.equal(TestStatus.Success);
    expect(result.tests[0].timeSpentMs).to.be.above(-1);
    expect(result.tests[0].failureMessages).to.be.an('array').that.is.empty;
    expect(result.status).to.equal(RunStatus.Complete);
  });

  it('should run tests on the example custom project using package.json', async () => {
    processCwdStub.returns(getProjectRoot('exampleProject'));

    jestConfigEditor.edit(strykerOptions);
    const jestTestRunner = new JestTestRunner(runnerOptions);

    const result = await jestTestRunner.run(runOptions);

    expect(result.errorMessages, `Errors were: ${result.errorMessages}`).lengthOf(0);
    expect(result).to.have.property('tests');
    expect(result.tests).to.be.an('array').with.length(testNames.length);

    for (const test of result.tests) {
      expect(testNames).to.include(test.name);
      expect(test.status).to.equal(TestStatus.Success);
      expect(test.timeSpentMs).to.be.above(-1);
      expect(test.failureMessages).to.be.an('array').that.is.empty;
    }

    expect(result.status).to.equal(RunStatus.Complete);
  });

  it('should run tests on the example custom project using jest.config.js', async () => {
    processCwdStub.returns(getProjectRoot('exampleProjectWithExplicitJestConfig'));

    jestConfigEditor.edit(strykerOptions);
    const jestTestRunner = new JestTestRunner(runnerOptions);

    const result = await jestTestRunner.run(runOptions);

    expect(result.errorMessages, `Errors were: ${result.errorMessages}`).lengthOf(0);
    expect(result).to.have.property('tests');
    expect(result.tests).to.be.an('array').with.length(testNames.length);

    for (const test of result.tests) {
      expect(testNames).to.include(test.name);
      expect(test.status).to.equal(TestStatus.Success);
      expect(test.timeSpentMs).to.be.above(-1);
      expect(test.failureMessages).to.be.an('array').that.is.empty;
    }

    expect(result.status).to.equal(RunStatus.Complete);
  });
});

function getProjectRoot(testResource: string) {
  return path.join(jestProjectRoot, 'testResources', testResource);
}
