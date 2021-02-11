import { assert, expect } from 'chai';
import sinon from 'sinon';

import { createReactJestConfig, createReactTsJestConfig } from '../../../src/utils/create-react-jest-config';

describe('createReactJestConfig', () => {
  let loaderStub: sinon.SinonStub;
  const loader: any = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    require: () => {},
  };

  beforeEach(() => {
    loaderStub = sinon.stub(loader, 'require');
    loaderStub.returns(() => {
      return 'jestConfig';
    });
  });

  it('should call the loader with the react jest config generator', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    createReactJestConfig(() => {}, '/path/to/project', false, loader.require);

    assert(loaderStub.calledWith('react-scripts/scripts/utils/createJestConfig'));
  });

  it('should return a jest config', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(createReactJestConfig(() => {}, '/path/to/project', false, loader.require)).to.equal('jestConfig');
  });
});

describe('createReactTsJestConfig', () => {
  let loaderStub: sinon.SinonStub;
  const loader: any = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    require: () => {},
  };

  beforeEach(() => {
    loaderStub = sinon.stub(loader, 'require');
    loaderStub.returns(() => 'jestConfig');
  });

  it('should call the loader with the react jest config generator', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    createReactTsJestConfig(() => {}, '/path/to/project', false, loader.require);

    assert(loaderStub.calledWith('react-scripts-ts/scripts/utils/createJestConfig'));
  });

  it('should return a jest config', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(createReactTsJestConfig(() => {}, '/path/to/project', false, loader.require)).to.equal('jestConfig');
  });
});
