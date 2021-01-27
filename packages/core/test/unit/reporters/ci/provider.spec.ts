import { expect } from 'chai';

import { determineCIProvider } from '../../../../src/reporters/ci/provider';
import { TravisProvider } from '../../../../src/reporters/ci/travis-provider';
import { CircleProvider } from '../../../../src/reporters/ci/circle-provider';
import { EnvironmentVariableStore } from '../../../helpers/environment-variable-store';
import { GithubActionsCIProvider } from '../../../../src/reporters/ci/github-actions-provider';

describe(determineCIProvider.name, () => {
  const env = new EnvironmentVariableStore();

  beforeEach(() => {
    env.unset('HAS_JOSH_K_SEAL_OF_APPROVAL');
    env.unset('CIRCLECI');
    env.unset('GITHUB_ACTION');
  });
  afterEach(() => {
    env.restore();
  });

  it('should not select a CI Provider when not in a CI environment', () => {
    const result = determineCIProvider();
    expect(result).to.be.null;
  });

  it('should provide Travis when running in the travis environment', () => {
    env.set('HAS_JOSH_K_SEAL_OF_APPROVAL', 'true');
    const result = determineCIProvider();
    expect(result).instanceOf(TravisProvider);
  });

  it('should provide CircleCI when running in the circle CI environment', () => {
    env.set('CIRCLECI', 'true');
    const result = determineCIProvider();
    expect(result).instanceOf(CircleProvider);
  });

  it('should provide Github when running in the github actions CI environment', () => {
    env.set('GITHUB_ACTION', 'true');
    const result = determineCIProvider();
    expect(result).instanceOf(GithubActionsCIProvider);
  });
});
