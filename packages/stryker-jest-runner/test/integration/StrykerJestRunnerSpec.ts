import JestConfigEditor from '../../src/JestConfigEditor';
import { Config } from 'stryker-api/config';
import { RunnerOptions, RunStatus, TestStatus } from 'stryker-api/test_runner';
import * as sinon from 'sinon';
import { expect } from 'chai';
import JestTestRunner from '../../src/JestTestRunner';
import * as path from 'path';

describe('Integration StrykerJestRunner', function () {
  this.timeout(10000);
  const jestTestRunnerRoot = process.cwd();
  const reactProjectRoot = path.join(jestTestRunnerRoot, 'testResources', 'reactProject');
  const exampleProjectRoot = path.join(jestTestRunnerRoot, 'testResources', 'exampleProject');

  let jestConfigEditor: JestConfigEditor;
  let runOptions: RunnerOptions;
  let getProjectRootStub: sinon.SinonStub;

  let sandbox: sinon.SinonSandbox;

  process.env.BABEL_ENV = 'test';

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    getProjectRootStub = sandbox.stub(process, 'cwd');

    jestConfigEditor = new JestConfigEditor();

    runOptions = {
      files: [],
      port: 0,
      strykerOptions: new Config
    };
  });

  afterEach(() => sandbox.restore());

  it('should run tests on the example react project', async () => {
    getProjectRootStub.returns(reactProjectRoot);
    runOptions.strykerOptions.set({ jest: { project: 'react' } });

    jestConfigEditor.edit(runOptions.strykerOptions as Config);

    const jestTestRunner = new JestTestRunner(runOptions);

    const result = await jestTestRunner.run();

    expect(result).to.have.property('tests');
    expect(result.tests).to.be.an('array').that.is.not.empty;
    expect(result.tests[0].name).to.equal('renders without crashing');
    expect(result.tests[0].status).to.equal(TestStatus.Success);
    expect(result.tests[0].timeSpentMs).to.be.above(0);
    expect(result.tests[0].failureMessages).to.be.an('array').that.is.empty;
    expect(result.status).to.equal(RunStatus.Complete);
  }).timeout(10000);

  it('should run tests on the example custom project', async () => {
    const testNames = [
      'Add should be able to add two numbers',
      'Add should be able to add one to a number',
      'Add should be able negate a number',
      'Add should be able to recognize a negative number',
      'Add should be able to recognize that 0 is not a negative number',
      'Circle should have a circumference of 2PI when the radius is 1'
    ];

    getProjectRootStub.returns(exampleProjectRoot);

    jestConfigEditor.edit(runOptions.strykerOptions as Config);
    const jestTestRunner = new JestTestRunner(runOptions);

    const result = await jestTestRunner.run();

    expect(result).to.have.property('tests');
    expect(result.tests).to.be.an('array').with.length(6);

    for (let test of result.tests) {
      expect(testNames).to.include(test.name);
      expect(test.status).to.equal(TestStatus.Success);
      expect(test.timeSpentMs).to.be.above(-1);
      expect(test.failureMessages).to.be.an('array').that.is.empty;
    }

    expect(result.status).to.equal(RunStatus.Complete);
  });
});