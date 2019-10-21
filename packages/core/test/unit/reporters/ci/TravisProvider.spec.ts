import { expect } from 'chai';
import TravisProvider from '../../../../src/reporters/ci/TravisProvider';
import { EnvironmentVariableStore } from '../../../helpers/EnvironmentVariableStore';

describe(TravisProvider.name, () => {
  const env = new EnvironmentVariableStore();
  let sut: TravisProvider;

  beforeEach(() => {
    sut = new TravisProvider();
  });

  afterEach(() => {
    env.restore();
  });

  describe('isPullRequest()', () => {
    it('should return false when not building a pull request', () => {
      env.set('TRAVIS_PULL_REQUEST', 'false');
      const result = sut.isPullRequest();
      expect(result).to.be.false;
    });

    it('should return true when building a pull request', () => {
      env.set('TRAVIS_PULL_REQUEST', '42');
      const result = sut.isPullRequest();
      expect(result).to.be.true;
    });
  });

  describe('determineVersion()', () => {
    it('should return the appropriate value', () => {
      env.set('TRAVIS_BRANCH', 'master');
      const result = sut.determineVersion();
      expect(result).to.equal('master');
    });

    it('should throw if branch is missing', () => {
      expect(sut.determineVersion.bind(sut)).throws('Missing environment variable "TRAVIS_BRANCH"');
    });
  });

  describe('determineSlug()', () => {
    it('should return the appropriate value', () => {
      env.set('TRAVIS_REPO_SLUG', 'stryker/stryker');
      const result = sut.determineSlug();

      expect(result).to.equal('github.com/stryker/stryker');
    });

    it('should throw if env var is missing', () => {
      expect(sut.determineSlug.bind(sut)).throws('Missing environment variable "TRAVIS_REPO_SLUG"');
    });
  });
});
