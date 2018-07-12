import JestTestAdapterFactory from '../../src/jestTestAdapters/JestTestAdapterFactory';
import JestTestRunner from '../../src/JestTestRunner';
import { Config } from 'stryker-api/config';
import * as fakeResults from '../helpers/testResultProducer';
import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import { RunStatus, TestStatus } from 'stryker-api/test_runner';
import * as log4js from 'log4js';

describe('JestTestRunner', () => {
  const basePath = '/path/to/project/root';

  let sandbox: sinon.SinonSandbox;
  let jestTestAdapterFactoryStub: sinon.SinonStub;
  let runJestStub: sinon.SinonStub;
  let debugLoggerStub: sinon.SinonStub;

  let strykerOptions: Config;
  let jestTestRunner: JestTestRunner;
  let processEnvMock: NodeJS.ProcessEnv;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    runJestStub = sinon.stub();
    runJestStub.resolves({ results: { testResults: [] } });

    debugLoggerStub = sandbox.stub();
    sandbox.stub(log4js, 'getLogger').returns({ debug: debugLoggerStub });

    strykerOptions = new Config;
    strykerOptions.set({ jest: { config: { property: 'value' } }, basePath });

    processEnvMock = {
      NODE_ENV: undefined
    };

    jestTestRunner = new JestTestRunner({
      fileNames: [],
      port: 0,
      strykerOptions
    }, processEnvMock);

    jestTestAdapterFactoryStub = sandbox.stub(JestTestAdapterFactory, 'getJestTestAdapter');
    jestTestAdapterFactoryStub.returns({
      run: runJestStub
    });
  });

  afterEach(() => sandbox.restore());

  it('should log the project root when constructing the JestTestRunner', () => {
    assert(debugLoggerStub.calledWith(`Project root is ${basePath}`));
  });

  it('should call jestTestAdapterFactory "getJestTestAdapter" method to obtain a testRunner', async () => {
    await jestTestRunner.run();

    assert(jestTestAdapterFactoryStub.called);
  });

  it('should call the run function with the provided config and the projectRoot', async () => {
    await jestTestRunner.run();

    assert(runJestStub.called);
  });

  it('should call the jestTestRunner run method and return a correct runResult', async () => {
    runJestStub.resolves({ results: fakeResults.createSuccessResult() });

    const result = await jestTestRunner.run();

    expect(result).to.deep.equal({
      status: RunStatus.Complete,
      tests: [
        {
          name: 'App renders without crashing',
          status: TestStatus.Success,
          timeSpentMs: 23,
          failureMessages: []
        }
      ],
      errorMessages: []
    });
  });

  it('should call the jestTestRunner run method and return a negative runResult', async () => {
    runJestStub.resolves({ results: fakeResults.createFailResult() });

    const result = await jestTestRunner.run();

    expect(result).to.deep.equal({
      status: RunStatus.Complete,
      tests: [{
        name: 'App render renders without crashing',
        status: TestStatus.Failed,
        timeSpentMs: 2,
        failureMessages: [
          'Fail message 1',
          'Fail message 2'
        ]
      },
      {
        name: 'App render renders without crashing',
        status: TestStatus.Failed,
        timeSpentMs: 0,
        failureMessages: [
          'Fail message 3',
          'Fail message 4'
        ]
      },
      {
        name: 'App renders without crashing',
        status: TestStatus.Success,
        timeSpentMs: 23,
        failureMessages: []
      }],
      errorMessages: ['test failed - App.test.js']
    });
  });

  it('should return an error result when a runtime error occurs', async () => {
    runJestStub.resolves({ results: { testResults: [], numRuntimeErrorTestSuites: 1 } });

    const result = await jestTestRunner.run();

    expect(result).to.deep.equal({
      status: RunStatus.Error,
      tests: [],
      errorMessages: []
    });
  });

  it('should set process.env.NODE_ENV to \'test\' when process.env.NODE_ENV is null', async () => {
    await jestTestRunner.run();

    expect(processEnvMock.NODE_ENV).to.equal('test');
  });

  it('should keep the value set in process.env.NODE_ENV if not null', async () => {
    processEnvMock.NODE_ENV = 'stryker';

    await jestTestRunner.run();

    expect(processEnvMock.NODE_ENV).to.equal('stryker');
  });
});