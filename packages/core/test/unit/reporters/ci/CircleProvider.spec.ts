import { expect } from 'chai';
import * as sinon from 'sinon';
import * as environmentVariables from '../../../../src/utils/objectUtils';

import CircleProvider from '../../../../src/reporters/ci/CircleProvider';

describe('CircleCI Provider', () => {
  let getEnvironmentVariables: sinon.SinonStub;

  beforeEach(() => {
    getEnvironmentVariables = sinon.stub(environmentVariables, 'getEnvironmentVariable');
  });

  describe('isPullRequest()', () => {
    it('should return false when not building a pull request', () => {
      getEnvironmentVariables.withArgs('CIRCLE_PULL_REQUEST').returns(undefined);
      const circleProvider = new CircleProvider();

      const result = circleProvider.isPullRequest();

      expect(result).to.be.false;
    });

    it('should return true when building a pull request', () => {
      // CIRCLE_PULL_REQUEST will be the URL of the PR being built.
      // If there was more than one PR, it will contain one 'em (picked randomly).
      // Either way, it will be populated.
      getEnvironmentVariables.withArgs('CIRCLE_PULL_REQUEST').returns('https://github.com/stryker-mutator/stryker/pull/42');
      const circleProvider = new CircleProvider();

      const result = circleProvider.isPullRequest();

      expect(result).to.be.true;
    });
  });

  describe('determineBranch()', () => {
    it('should return the appropriate value', () => {
      getEnvironmentVariables.withArgs('CIRCLE_BRANCH').returns('master');
      const circleProvider = new CircleProvider();

      const result = circleProvider.determineBranch();

      expect(result).to.equal('master');
    });

    it('should return a fall-back value', () => {
      getEnvironmentVariables.withArgs('CIRCLE_BRANCH').returns('');
      const circleProvider = new CircleProvider();

      const result = circleProvider.determineBranch();

      expect(result).to.equal('(unknown)');
    });
  });

  describe('determineRepository()', () => {
    it('should return the appropriate value', () => {
      getEnvironmentVariables.withArgs('CIRCLE_PROJECT_USERNAME').returns('stryker');
      getEnvironmentVariables.withArgs('CIRCLE_PROJECT_REPONAME').returns('stryker');
      const circleProvider = new CircleProvider();

      const result = circleProvider.determineRepository();

      expect(result).to.equal('stryker/stryker');
    });

    it('should return a fall-back value', () => {
      getEnvironmentVariables.withArgs('CIRCLE_PROJECT_USERNAME').returns('');
      getEnvironmentVariables.withArgs('CIRCLE_PROJECT_REPONAME').returns('');
      const circleProvider = new CircleProvider();

      const result = circleProvider.determineRepository();

      expect(result).to.equal('(unknown)');
    });
  });
});
