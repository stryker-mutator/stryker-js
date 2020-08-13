import { expect } from 'chai';
import { StrykerError } from '@stryker-mutator/util';

import { GithubActionsCIProvider } from '../../../../src/reporters/ci/GithubActionsProvider';
import { EnvironmentVariableStore } from '../../../helpers/EnvironmentVariableStore';

describe(GithubActionsCIProvider.name, () => {
  const env = new EnvironmentVariableStore();
  let sut: GithubActionsCIProvider;
  beforeEach(() => {
    sut = new GithubActionsCIProvider();
  });
  afterEach(() => {
    env.restore();
  });

  describe('determineProject()', () => {
    it('should return the appropriate value', () => {
      env.set('GITHUB_REPOSITORY', 'stryker/stryker');
      const result = sut.determineProject();
      expect(result).eq('github.com/stryker/stryker');
    });

    it('should throw if env variable is missing', () => {
      env.unset('GITHUB_REPOSITORY');
      expect(() => sut.determineProject()).throws(StrykerError);
    });
  });

  describe('determineVersion()', () => {
    it('should retrieve the PR name', () => {
      //"refs/pull/:prNumber/merge" or "refs/heads/feat/branch-1"
      env.set('GITHUB_REF', 'refs/pull/156/merge');
      expect(sut.determineVersion()).eq('PR-156');
    });

    it('should retrieve the branch name', () => {
      env.set('GITHUB_REF', 'refs/heads/feat/branch-1');
      expect(sut.determineVersion()).eq('feat/branch-1');
    });

    it('should throw if env variable is missing', () => {
      env.unset('GITHUB_REF');
      expect(() => sut.determineVersion()).throws(StrykerError);
    });
  });
});
