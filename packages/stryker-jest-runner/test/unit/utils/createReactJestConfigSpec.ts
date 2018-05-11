import { createReactJestConfig, createReactTsJestConfig } from '../../../src/utils/createReactJestConfig';
import { expect, assert } from 'chai';
import * as sinon from 'sinon';

describe('createReactJestConfig', () => {
  let loaderStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  let loader: any = {
    require: () => {}
  };
  
  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    loaderStub = sandbox.stub(loader, 'require');
    loaderStub.returns((resolve: Function, projectRoot: string, ejected: boolean) => {
      return 'jestConfig';
    });
  });

  afterEach(() => sandbox.restore());

  it('should call the loader with the react jest config generator', () => {
    createReactJestConfig(() => {}, '/path/to/project', false, loader.require);

    assert(loaderStub.calledWith('react-scripts/scripts/utils/createJestConfig'));
  });

  it('should return a jest config', () => {
    expect(createReactJestConfig(() => {}, '/path/to/project', false, loader.require)).to.equal('jestConfig');
  });
});

describe('createReactTsJestConfig', () => {
  let loaderStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  let loader: any = {
    require: () => {}
  };
  
  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    loaderStub = sandbox.stub(loader, 'require');
    loaderStub.returns((resolve: Function, projectRoot: string, ejected: boolean) => {
      return 'jestConfig';
    });
  });

  afterEach(() => sandbox.restore());

  it('should call the loader with the react jest config generator', () => {
    createReactTsJestConfig(() => {}, '/path/to/project', false, loader.require);

    assert(loaderStub.calledWith('react-scripts-ts/scripts/utils/createJestConfig'));
  });

  it('should return a jest config', () => {
    expect(createReactTsJestConfig(() => {}, '/path/to/project', false, loader.require)).to.equal('jestConfig');
  });
});
