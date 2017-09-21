import * as sinon from 'sinon';
import { TestRunnerFactory } from 'stryker-api/test_runner';
import { TestFrameworkFactory } from 'stryker-api/test_framework';
import { ConfigEditorFactory } from 'stryker-api/config';
import { ReporterFactory } from 'stryker-api/report';
import JestTestRunner from '../../src/JestTestRunner';
import { expect } from 'chai';
import * as path from 'path';

describe('index', () => {
  let sandbox: sinon.SinonSandbox;

  const mockFactory = () => ({ register: sinon.stub() });
  let testRunnerFactoryMock: any;
  let testFrameworkFactoryMock: any;
  let reporterFactoryMock: any;
  let configEditorFactoryMock: any;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    testRunnerFactoryMock = mockFactory();
    testFrameworkFactoryMock = mockFactory();
    reporterFactoryMock = mockFactory();
    configEditorFactoryMock = mockFactory();

    sandbox.stub(TestFrameworkFactory, 'instance').returns(testFrameworkFactoryMock);
    sandbox.stub(TestRunnerFactory, 'instance').returns(testRunnerFactoryMock);
    sandbox.stub(ReporterFactory, 'instance').returns(reporterFactoryMock);
    sandbox.stub(ConfigEditorFactory, 'instance').returns(configEditorFactoryMock);

    // Do not import the `index` file es6 style, because we need to 
    // make sure it is re-imported every time.
    const indexPath = path.resolve('./src/index.js');
    delete require.cache[indexPath];
    require('../../src/index');
  });

  it('should register the JestTestRunner', () =>
    expect(testRunnerFactoryMock.register).to.have.been.calledWith('jest', JestTestRunner));

  afterEach(() => sandbox.restore());
});
