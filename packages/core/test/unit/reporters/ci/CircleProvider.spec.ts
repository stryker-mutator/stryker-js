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

  describe('determineVersion', () => {
    it('should return the branch name', () => {
      env.set('CIRCLE_BRANCH', 'master');
      const result = sut.determineVersion();

      expect(result).to.equal('master');
    });

    it('should fallback to tag if no branch is available', () => {
      env.set('CIRCLE_BRANCH', '');
      env.set('CIRCLE_TAG', '1.0.0');

      const result = sut.determineVersion();

      expect(result).to.equal('1.0.0');
    });

    it('should prioritize the PR number if available', () => {
      env.set('CIRCLE_PR_NUMBER', 'feature/foo-bar');
      env.set('CIRCLE_BRANCH', 'master');
      env.set('CIRCLE_TAG', '1.0.0');

      const result = sut.determineVersion();

      expect(result).to.equal('feature/foo-bar');
    });
  });

  describe('determineProject()', () => {
    it('should return the appropriate value', () => {
      env.set('CIRCLE_PROJECT_USERNAME', 'stryker-mutator');
      env.set('CIRCLE_PROJECT_REPONAME', 'stryker');
      env.set('CIRCLE_REPOSITORY_URL', 'https://github.com/foo/bar');

      const result = sut.determineProject();

      expect(result).to.equal('github.com/stryker-mutator/stryker');
    });

    it('should support url formated as as ssh address', () => {
      env.set('CIRCLE_PROJECT_USERNAME', 'stryker-mutator');
      env.set('CIRCLE_PROJECT_REPONAME', 'stryker');
      env.set('CIRCLE_REPOSITORY_URL', 'git@github.com:foo:bar');

      const result = sut.determineProject();

      expect(result).to.equal('github.com/stryker-mutator/stryker');
    });

    it('should throw if env variable is missing', () => {
      expect(sut.determineProject.bind(sut)).throws('Missing environment variable "CIRCLE_REPOSITORY_URL');
    });
  });
});
