import JestTestAdapterFactory from '../../src/jestTestAdapters/JestTestAdapterFactory';
import JestTestRunner from '../../src/JestTestRunner';
import { Config } from 'stryker-api/config';
import * as fakeResults from '../helpers/testResultProducer';
import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import { RunStatus, TestStatus, RunOptions } from 'stryker-api/test_runner';
import currentLogMock from '../helpers/logMock';

describe('JestTestRunner', () => {
  const basePath = '/path/to/project/root';
  const runOptions: RunOptions = { timeout: 0 };

  let jestTestAdapterFactoryStub: sinon.SinonStub;
  let runJestStub: sinon.SinonStub;
  let strykerOptions: Config;
  let jestTestRunner: JestTestRunner;
  let processEnvMock: NodeJS.ProcessEnv;

  beforeEach(() => {
    runJestStub = sinon.stub();
    runJestStub.resolves({ results: { testResults: [] } });

    strykerOptions = new Config();
    strykerOptions.set({ jest: { config: { property: 'value' } }, basePath });

    processEnvMock = {
      NODE_ENV: undefined
    };

    jestTestRunner = new JestTestRunner({
      fileNames: [],
      strykerOptions
    }, processEnvMock);

    jestTestAdapterFactoryStub = sinon.stub(JestTestAdapterFactory, 'getJestTestAdapter');
    jestTestAdapterFactoryStub.returns({
      run: runJestStub
    });
  });

  it('should log the project root when constructing the JestTestRunner', () => {
    assert(currentLogMock().debug.calledWith(`Project root is ${basePath}`));
  });

  it('should call jestTestAdapterFactory "getJestTestAdapter" method to obtain a testRunner', async () => {
    await jestTestRunner.run(runOptions);

    assert(jestTestAdapterFactoryStub.called);
  });

  it('should call the run function with the provided config and the projectRoot', async () => {
    await jestTestRunner.run(runOptions);

    assert(runJestStub.called);
  });

  it('should call the jestTestRunner run method and return a correct runResult', async () => {
    runJestStub.resolves({ results: fakeResults.createSuccessResult() });

    const result = await jestTestRunner.run(runOptions);

    expect(result).to.deep.equal({
      errorMessages: [],
      status: RunStatus.Complete,
      tests: [
        {
          failureMessages: [],
          name: 'App renders without crashing',
          status: TestStatus.Success,
          timeSpentMs: 23
        }
      ]
    });
  });

  it('should call the jestTestRunner run method and return a skipped runResult', async () => {
    runJestStub.resolves({ results: fakeResults.createPendingResult() });

    const result = await jestTestRunner.run(runOptions);

    expect(result).to.deep.equal({
      errorMessages: [],
      status: RunStatus.Complete,
      tests: [
        {
          failureMessages: [],
          name: 'App renders without crashing',
          status: TestStatus.Skipped,
          timeSpentMs: 0
        }
      ]
    });
  });

  it('should call the jestTestRunner run method and return a negative runResult', async () => {
    runJestStub.resolves({ results: fakeResults.createFailResult() });

    const result = await jestTestRunner.run(runOptions);

    expect(result).to.deep.equal({
      errorMessages: ['test failed - App.test.js'],
      status: RunStatus.Complete,
      tests: [{
        failureMessages: [
          'Fail message 1',
          'Fail message 2'
        ],
        name: 'App render renders without crashing',
        status: TestStatus.Failed,
        timeSpentMs: 2
      },
      {
        failureMessages: [
          'Fail message 3',
          'Fail message 4'
        ],
        name: 'App render renders without crashing',
        status: TestStatus.Failed,
        timeSpentMs: 0
      },
      {
        failureMessages: [],
        name: 'App renders without crashing',
        status: TestStatus.Success,
        timeSpentMs: 23
      }]
    });
  });

  it('should return an error result when a runtime error occurs', async () => {
    runJestStub.resolves({ results: { testResults: [], numRuntimeErrorTestSuites: 1 } });

    const result = await jestTestRunner.run(runOptions);

    expect(result).to.deep.equal({
      errorMessages: [],
      status: RunStatus.Error,
      tests: []
    });
  });

  it('should set process.env.NODE_ENV to \'test\' when process.env.NODE_ENV is null', async () => {
    await jestTestRunner.run(runOptions);

    expect(processEnvMock.NODE_ENV).to.equal('test');
  });

  it('should keep the value set in process.env.NODE_ENV if not null', async () => {
    processEnvMock.NODE_ENV = 'stryker';

    await jestTestRunner.run(runOptions);

    expect(processEnvMock.NODE_ENV).to.equal('stryker');
  });
});
