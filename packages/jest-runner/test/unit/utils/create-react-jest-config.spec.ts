import { assert, expect } from 'chai';
import sinon from 'sinon';

import { createReactJestConfig, createReactTsJestConfig } from '../../../src/utils/create-react-jest-config';

describe('create-jest-config', () => {
  let requireStub: sinon.SinonStub;

  beforeEach(() => {
    requireStub = sinon.stub();
    requireStub.returns(() => 'jestConfig');
  });

  describe('createReactJestConfig', () => {
    it('should call the loader with the react jest config generator', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      createReactJestConfig(() => {}, '/path/to/project', false, requireStub as unknown as NodeRequire);

      assert(requireStub.calledWith('react-scripts/scripts/utils/createJestConfig'));
    });

    it('should return a jest config', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(createReactJestConfig(() => {}, '/path/to/project', false, requireStub as unknown as NodeRequire)).to.equal('jestConfig');
    });
  });
  describe('createReactTsJestConfig', () => {
    it('should call the loader with the react jest config generator', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      createReactTsJestConfig(() => {}, '/path/to/project', false, requireStub as unknown as NodeRequire);

      assert(requireStub.calledWith('react-scripts-ts/scripts/utils/createJestConfig'));
    });

    it('should return a jest config', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(createReactTsJestConfig(() => {}, '/path/to/project', false, requireStub as unknown as NodeRequire)).to.equal('jestConfig');
    });
  });
});
