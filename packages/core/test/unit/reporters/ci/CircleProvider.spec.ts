import { expect } from 'chai';
import CircleProvider from '../../../../src/reporters/ci/CircleProvider';
import { EnvironmentVariableStore } from '../../../helpers/EnvironmentVariableStore';

describe(CircleProvider.name, () => {
  let sut: CircleProvider;
  const env = new EnvironmentVariableStore();

  beforeEach(() => {
    sut = new CircleProvider();
  });

  afterEach(() => {
    env.restore();
  });

  describe('isPullRequest()', () => {
    it('should return false when not building a pull request', () => {
      env.unset('CIRCLE_PULL_REQUEST');

      const result = sut.isPullRequest();

      expect(result).to.be.false;
    });

    it('should return true when building a pull request', () => {
      // CIRCLE_PULL_REQUEST will be the URL of the PR being built.
      // If there was more than one PR, it will contain one 'em (picked randomly).
      // Either way, it will be populated.
      env.set('CIRCLE_PULL_REQUEST', 'https://github.com/stryker-mutator/stryker/pull/42');

      const result = sut.isPullRequest();

      expect(result).to.be.true;
    });
  });

  describe('determineVersion', () => {
    it('should return the branch name', () => {
      env.set('CIRCLE_BRANCH', 'master');
      const result = sut.determineVersion();

      expect(result).to.equal('master');
    });

    it('should fallback to tag', () => {
      env.set('CIRCLE_BRANCH', '');
      env.set('CIRCLE_TAG', '1.0.0');

      const result = sut.determineVersion();

      expect(result).to.equal('1.0.0');
    });

    it('should fallback to "unknown" of there is no branch or tag', () => {
      const result = sut.determineVersion();

      expect(result).to.equal('unknown');
    });
  });

  describe('determineSlug()', () => {
    it('should return the appropriate value', () => {
      env.set('CIRCLE_PROJECT_USERNAME', 'stryker-mutator');
      env.set('CIRCLE_PROJECT_REPONAME', 'stryker');
      env.set('CIRCLE_REPOSITORY_URL', 'https://github.com/foo/bar');

      const result = sut.determineSlug();

      expect(result).to.equal('github.com/stryker-mutator/stryker');
    });

    it('should support url formated as as ssh address', () => {
      env.set('CIRCLE_PROJECT_USERNAME', 'stryker-mutator');
      env.set('CIRCLE_PROJECT_REPONAME', 'stryker');
      env.set('CIRCLE_REPOSITORY_URL', 'git@github.com:foo:bar');

      const result = sut.determineSlug();

      expect(result).to.equal('github.com/stryker-mutator/stryker');
    });

    it('should throw if env variable is missing', () => {
      expect(sut.determineSlug.bind(sut)).throws('Missing environment variable "CIRCLE_REPOSITORY_URL');
    });
  });
});
