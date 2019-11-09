import { expect } from 'chai';
import * as sinon from 'sinon';
import * as environmentVariables from '../../../../src/utils/objectUtils';

import { determineCIProvider } from '../../../../src/reporters/ci/Provider';

describe('determineCiProvider()', () => {
  let getEnvironmentVariables: sinon.SinonStub;

  beforeEach(() => {
    getEnvironmentVariables = sinon.stub(environmentVariables, 'getEnvironmentVariable');
  });

  describe('Without CI environment', () => {
    it('should not select a CI Provider', () => {
      getEnvironmentVariables.withArgs('HAS_JOSH_K_SEAL_OF_APPROVAL').returns('');

      const result = determineCIProvider();

      expect(result).to.be.undefined;
    });
  });

  describe("When HAS_JOSH_K_SEAL_OF_APPROVAL is 'true'", () => {
    it('should provide a CI Provider implementation', () => {
      getEnvironmentVariables.withArgs('HAS_JOSH_K_SEAL_OF_APPROVAL').returns(true);

      const result = determineCIProvider();

      expect(result).to.be.not.undefined;
    });
  });

  describe("When CIRCLECI is 'true'", () => {
    it('should provide a CI Provider implementation', () => {
      getEnvironmentVariables.withArgs('CIRCLECI').returns(true);

      const result = determineCIProvider();

      expect(result).to.be.not.undefined;
    });
  });
});
