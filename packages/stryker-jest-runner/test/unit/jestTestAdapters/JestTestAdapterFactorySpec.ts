import JestTestAdapterFactory from '../../../src/jestTestAdapters/JestTestAdapterFactory';
import JestPromiseTestAdapter, * as jestPromiseTestAdapter from '../../../src/jestTestAdapters/JestPromiseTestAdapter';
import * as sinon from 'sinon';
import { expect, assert } from 'chai';

const loader: any = {
  require: () => {}
};

describe('JestTestAdapterFactory', () => {
  let jestPromiseTestAdapterStub: TestAdapterStub;
  let requireStub: sinon.SinonStub;
  let debugLoggerStub: sinon.SinonStub;

  beforeEach(() => {
    jestPromiseTestAdapterStub = sinon.createStubInstance(JestPromiseTestAdapter);
    sinon.stub(jestPromiseTestAdapter, 'default').returns(jestPromiseTestAdapterStub);
    requireStub = sinon.stub(loader, 'require');
    debugLoggerStub = (JestTestAdapterFactory as any).log.debug = sinon.stub();
  });

  it('should return a Promise-based adapter when the Jest version is higher or equal to 22.0.0', () => {
    requireStub.returns({ version: '22.0.0' });

    const testAdapter = JestTestAdapterFactory.getJestTestAdapter(loader.require);

    expect(testAdapter).to.equal(jestPromiseTestAdapterStub);
  });

  it('should load the Jest package.json with require', () => {
    requireStub.returns({ version: '22.0.0' });

    JestTestAdapterFactory.getJestTestAdapter(loader.require);

    assert(requireStub.calledWith('jest/package.json'), 'require not called with "jest/package.json"');
  });

  it('should throw an error when the Jest version is lower than 22.0.0', () => {
    requireStub.returns({ version: '21.0.0' });

    expect(() => JestTestAdapterFactory.getJestTestAdapter(loader.require)).to.throw(Error, 'You need Jest version >= 22.0.0 to use Stryker');
  });

  it('should log a debug message when a Jest verion below 22.0.0 is used', () => {
    requireStub.returns({ version: '21.0.0' });

    try {
      JestTestAdapterFactory.getJestTestAdapter(loader.require);

      assert(false, 'We should never reach this part of the script');
    } catch {
      assert(debugLoggerStub.calledWith('Detected Jest below 22.0.0'));
    }
  });
});

interface TestAdapterStub {
  run: sinon.SinonStub;
}
