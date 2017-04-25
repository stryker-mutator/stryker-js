import * as sinon from 'sinon';
import * as path from 'path';
import { TestFrameworkFactory } from 'stryker-api/test_framework';
import { expect } from 'chai';
import JasmineTestFramework from '../../src/JasmineTestFramework';

describe('index', () => {
  let sandbox: sinon.SinonSandbox;

  const mockFactory = () => ({ register: sinon.stub() });
  let testFrameworkFactoryMock: any;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    testFrameworkFactoryMock = mockFactory();

    sandbox.stub(TestFrameworkFactory, 'instance').returns(testFrameworkFactoryMock);

    // Not import the `index` file es6 style, because we need to 
    // make sure it is re-imported every time.
    const indexPath = path.resolve('./src/index.js');
    delete require.cache[indexPath];
    require('../../src/index');
  });

  it('should register the JasmineTestFramework', () =>
    expect(testFrameworkFactoryMock.register).to.have.been.calledWith('jasmine', JasmineTestFramework));

  afterEach(() => sandbox.restore());
});