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

  describe('determineVersion()', () => {
    it('should return the current branch', () => {
      env.set('TRAVIS_BRANCH', 'master');
      env.unset('TRAVIS_PULL_REQUEST_BRANCH');
      const result = sut.determineVersion();
      expect(result).to.equal('master');
    });

    it('should return the PR branch if that is set', () => {
      env.set('TRAVIS_BRANCH', 'master');
      env.set('TRAVIS_PULL_REQUEST_BRANCH', 'feat/foo-bar');
      const result = sut.determineVersion();
      expect(result).to.equal('feat/foo-bar');
    });
  });

  describe('determineProject()', () => {
    it('should return the appropriate value', () => {
      env.set('TRAVIS_REPO_SLUG', 'stryker/stryker');
      const result = sut.determineProject();

      expect(result).to.equal('github.com/stryker/stryker');
    });

    it('should return undefined if missing', () => {
      expect(sut.determineProject()).undefined;
    });
  });
});
