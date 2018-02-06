import JestTestAdapterFactory from '../../../src/jestTestAdapters/JestTestAdapterFactory';
import JestPromiseTestAdapter, * as jestPromiseTestAdapter from '../../../src/jestTestAdapters/JestPromiseTestAdapter';
import JestCallbackTestAdapter, * as jestCallbackTestAdapter from '../../../src/jestTestAdapters/JestCallbackTestAdapter';
import * as sinon from 'sinon';
import { expect, assert } from 'chai';

const loader: any = {
  require: () => {}
};

describe('JestTestAdapterFactory', () => {
  let sandbox: sinon.SinonSandbox;
  let jestPromiseTestAdapterStub: TestAdapterStub;
  let jestCallbackTestAdapterStub: TestAdapterStub;
  let requireStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    jestPromiseTestAdapterStub = sinon.createStubInstance(JestPromiseTestAdapter);
    jestCallbackTestAdapterStub = sinon.createStubInstance(JestCallbackTestAdapter);

    sandbox.stub(jestPromiseTestAdapter, 'default').returns(jestPromiseTestAdapterStub);
    sandbox.stub(jestCallbackTestAdapter, 'default').returns(jestCallbackTestAdapterStub);

    requireStub = sandbox.stub(loader, 'require');
  });

  afterEach(() => sandbox.restore());

  it('should return a JestPromiseAdapter when the jest version is higher or equal to 21.0.0', () => {
    requireStub.returns({ version: '21.0.0' });

    const testAdapter = JestTestAdapterFactory.getJestTestAdapter(loader.require);

    expect(testAdapter).to.equal(jestPromiseTestAdapterStub);
  });

  it('should return a JestCallbackTestAdapter when the jest version is lower than 21.0.0 but higher or equal to 20.0.0', () => {
    requireStub.returns({ version: '20.0.0' });

    const testAdapter = JestTestAdapterFactory.getJestTestAdapter(loader.require);

    expect(testAdapter).to.equal(jestCallbackTestAdapterStub);
  });

  it('should load the jest package.json with require', () => {
    requireStub.returns({ version: '20.0.0' });

    JestTestAdapterFactory.getJestTestAdapter(loader.require);

    assert(requireStub.calledWith('jest/package.json'), 'require not called with "jest/package.json"');
  });

  it('should throw an error when the jest version is lower than 20.0.0', () => {
    requireStub.returns({ version: '19.0.0' });

    expect(() => JestTestAdapterFactory.getJestTestAdapter(loader.require)).to.throw(Error, 'You need Jest version >= 20.0.0 to use Stryker');
  });
});

interface TestAdapterStub {
  run: sinon.SinonStub;
}