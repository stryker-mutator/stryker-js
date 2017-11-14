import { expect } from 'chai';
import * as tsHelpers from '../../../src/helpers/tsHelpers';
import * as semver from 'semver';
import * as ts from 'typescript';

describe('tsHelpers', () => {

  let satisfiesStub: sinon.SinonStub;

  beforeEach(() => {
    satisfiesStub = sandbox.stub(semver, 'satisfies');
  });

  describe('guardTypescriptVersion', () => {

    it('should throw an error when installed typescript version does not satisfy >=2.5', () => {
      satisfiesStub.returns(false);
      expect(() => tsHelpers.guardTypescriptVersion()).throws(`Installed typescript version ${ts.version} is not supported by stryker-typescript. Please install version 2.5 or higher (\`npm install typescript@^2.5\`).`);
      expect(satisfiesStub).calledWith(ts.version, '>=2.5');
    });

    it('should not throw an error if installed version satisfies >=2.5', () => {
      satisfiesStub.returns(true);
      expect(() => tsHelpers.guardTypescriptVersion()).not.throws();
    });
  });
});