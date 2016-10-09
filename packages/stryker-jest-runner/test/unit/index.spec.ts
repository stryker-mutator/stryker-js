import * as sinon from 'sinon';
import { TestRunnerFactory } from 'stryker-api/test_runner';
import { TestFrameworkFactory } from 'stryker-api/test_framework';
import { ConfigWriterFactory } from 'stryker-api/config';
import { MutatorFactory } from 'stryker-api/mutant';
import { ReporterFactory } from 'stryker-api/report';
import MyReporter from '../../src/MyReporter';
import MyTestRunner from '../../src/MyTestRunner';
import MyTestFramework from '../../src/MyTestFramework';
import MyMutator from '../../src/MyMutator';
import MyConfigWriter from '../../src/MyConfigWriter';
import { expect } from 'chai';
import * as path from 'path';

describe('index', () => {
  let sandbox: sinon.SinonSandbox;

  const mockFactory = () => ({ register: sinon.stub() });
  let testRunnerFactoryMock: any;
  let testFrameworkFactoryMock: any;
  let reporterFactoryMock: any;
  let mutatorFactoryMock: any;
  let configWriterFactoryMock: any;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    testRunnerFactoryMock = mockFactory();
    testFrameworkFactoryMock = mockFactory();
    reporterFactoryMock = mockFactory();
    mutatorFactoryMock = mockFactory();
    configWriterFactoryMock = mockFactory();

    sandbox.stub(TestFrameworkFactory, 'instance').returns(testFrameworkFactoryMock);
    sandbox.stub(TestRunnerFactory, 'instance').returns(testRunnerFactoryMock);
    sandbox.stub(ReporterFactory, 'instance').returns(reporterFactoryMock);
    sandbox.stub(MutatorFactory, 'instance').returns(mutatorFactoryMock);
    sandbox.stub(ConfigWriterFactory, 'instance').returns(configWriterFactoryMock);

    // Not import the `index` file es6 style, because we need to 
    // make sure is is re-imported every time.
    const indexPath = path.resolve('./src/index.js');
    delete require.cache[indexPath];
    require('../../src/index');
  });

  it('should register the MyTestFramework', () =>
    expect(testFrameworkFactoryMock.register).to.have.been.calledWith('my-test-framework', MyTestFramework));

  it('should register the MyTestRunner', () =>
    expect(testRunnerFactoryMock.register).to.have.been.calledWith('my-test-runner', MyTestRunner));

  it('should register the MyReporter', () =>
    expect(reporterFactoryMock.register).to.have.been.calledWith('my-reporter', MyReporter));

  it('should register the MyMutator', () =>
    expect(mutatorFactoryMock.register).to.have.been.calledWith('my-mutator', MyMutator));

  it('should register the MyConfigWriter', () =>
    expect(configWriterFactoryMock.register).to.have.been.calledWith('my-config-writer', MyConfigWriter));

  afterEach(() => sandbox.restore());
});