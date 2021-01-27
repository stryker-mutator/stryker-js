import { assert, expect } from 'chai';
import sinon from 'sinon';

import { createReactJestConfig, createReactTsJestConfig } from '../../../src/utils/create-react-jest-config';

describe('createReactJestConfig', () => {
  let loaderStub: sinon.SinonStub;
  const loader: any = {
    require: () => {},
  };

  beforeEach(() => {
    loaderStub = sinon.stub(loader, 'require');
    loaderStub.returns(() => {
      return 'jestConfig';
    });
  });

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
  const loader: any = {
    require: () => {},
  };

  beforeEach(() => {
    loaderStub = sinon.stub(loader, 'require');
    loaderStub.returns(() => 'jestConfig');
  });

  it('should call the loader with the react jest config generator', () => {
    createReactTsJestConfig(() => {}, '/path/to/project', false, loader.require);

    assert(loaderStub.calledWith('react-scripts-ts/scripts/utils/createJestConfig'));
  });

  it('should return a jest config', () => {
    expect(createReactTsJestConfig(() => {}, '/path/to/project', false, loader.require)).to.equal('jestConfig');
  });
});
