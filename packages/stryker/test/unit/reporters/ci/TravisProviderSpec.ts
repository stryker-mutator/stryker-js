import { expect } from 'chai';
import * as sinon from 'sinon';
import * as environmentVariables from '../../../../src/utils/objectUtils';

import TravisProvider from '../../../../src/reporters/ci/TravisProvider';

describe('Travis Provider', () => {
  let getEnvironmentVariables: sinon.SinonStub;

  const travisProvider = new TravisProvider();

  beforeEach(() => {
    getEnvironmentVariables = sandbox.stub(environmentVariables, 'getEnvironmentVariable');
  });

  describe('isPullRequest()', () => {
    it('should return false when not building a pull request', () => {
      getEnvironmentVariables.withArgs('TRAVIS_PULL_REQUEST').returns('false');
  
      const result = travisProvider.isPullRequest();
  
      expect(result).to.be.false;
    });

    it('should return true when building a pull request', () => {
      getEnvironmentVariables.withArgs('TRAVIS_PULL_REQUEST').returns('42');
  
      const result = travisProvider.isPullRequest();
  
      expect(result).to.be.true;
    });
  });

  describe('determineBranch()', () => {
    it('should return the appropriate value', () => {
      getEnvironmentVariables.withArgs('TRAVIS_BRANCH').returns('master');
  
      const result = travisProvider.determineBranch();
  
      expect(result).to.equal('master');
    });

    it('should return a fall-back value', () => {
      getEnvironmentVariables.withArgs('TRAVIS_BRANCH').returns('');
  
      const result = travisProvider.determineBranch();
  
      expect(result).to.equal('(unknown)');
    });
  });

  describe('determineRepository()', () => {
    it('should return the appropriate value', () => {
      getEnvironmentVariables.withArgs('TRAVIS_REPO_SLUG').returns('stryker/stryker');
  
      const result = travisProvider.determineRepository();
  
      expect(result).to.equal('stryker/stryker');
    });
    
    it('should return a fall-back value', () => {
      getEnvironmentVariables.withArgs('TRAVIS_REPO_SLUG').returns('');
  
      const result = travisProvider.determineRepository();
  
      expect(result).to.equal('(unknown)');
    });
  });

});