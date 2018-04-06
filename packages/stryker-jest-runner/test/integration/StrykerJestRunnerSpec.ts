import JestConfigEditor from '../../src/JestConfigEditor';
import { Config } from 'stryker-api/config';
import { RunnerOptions, RunStatus, TestStatus } from 'stryker-api/test_runner';
import * as sinon from 'sinon';
import { expect } from 'chai';
import JestTestRunner from '../../src/JestTestRunner';
import * as path from 'path';

// Get the project root, we will be stub process.cwd later on
const jestProjectRoot = process.cwd();

// Needed for Jest in order to run tests
process.env.BABEL_ENV = 'test';

describe('Integration StrykerJestRunner', function () {
  // Set timeout for integration tests to 10 seconds for travis
  this.timeout(10000);

  let jestConfigEditor: JestConfigEditor;
  let runOptions: RunnerOptions;
  let processCwdStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;

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
    sandbox = sinon.createSandbox();

    processCwdStub = sandbox.stub(process, 'cwd');

    jestConfigEditor = new JestConfigEditor();

    runOptions = {
      fileNames: [],
      port: 0,
      strykerOptions: new Config
    };
  });

  afterEach(() => sandbox.restore());

  it('should run tests on the example react project', async () => {
    processCwdStub.returns(getProjectRoot('reactProject'));
    runOptions.strykerOptions.set({ jest: { project: 'react' } });

    jestConfigEditor.edit(runOptions.strykerOptions as Config);

    const jestTestRunner = new JestTestRunner(runOptions);

    const result = await jestTestRunner.run();

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

    jestConfigEditor.edit(runOptions.strykerOptions as Config);
    const jestTestRunner = new JestTestRunner(runOptions);

    const result = await jestTestRunner.run();

    expect(result).to.have.property('tests');
    expect(result.tests).to.be.an('array').with.length(testNames.length);

    for (let test of result.tests) {
      expect(testNames).to.include(test.name);
      expect(test.status).to.equal(TestStatus.Success);
      expect(test.timeSpentMs).to.be.above(-1);
      expect(test.failureMessages).to.be.an('array').that.is.empty;
    }

    expect(result.status).to.equal(RunStatus.Complete);
  });

  it('should run tests on the example custom project using jest.config.js', async () => {
    processCwdStub.returns(getProjectRoot('exampleProjectWithExplicitJestConfig'));

    jestConfigEditor.edit(runOptions.strykerOptions as Config);
    const jestTestRunner = new JestTestRunner(runOptions);

    const result = await jestTestRunner.run();

    expect(result).to.have.property('tests');
    expect(result.tests).to.be.an('array').with.length(testNames.length);

    for (let test of result.tests) {
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