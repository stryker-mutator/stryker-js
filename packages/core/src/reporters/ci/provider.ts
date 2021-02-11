import { getEnvironmentVariable } from '../../utils/object-utils';

import { CircleProvider } from './circle-provider';
import { TravisProvider } from './travis-provider';
import { GithubActionsCIProvider } from './github-actions-provider';

/**
 * Represents an object that can provide information about a CI/CD provider.
 */
export interface CIProvider {
  /**
   * Determine the repository slug, including the git provider. I.E: github.com/stryker-mutator/stryker or bitbucket.org/org/name.
   */
  determineProject(): string | undefined;
  /**
   * Determine the current version. I.e. branch name, git sha, or tag name
   */
  determineVersion(): string | undefined;
}

/**
 * Return an appropriate instance of CiProvider.
 * @returns An instance of CiProvider, or `null` if it appears Stryker is not running in a CI/CD environment.
 */
export function determineCIProvider(): CircleProvider | GithubActionsCIProvider | TravisProvider | null {
  // By far the coolest env. variable from all those listed at
  // https://docs.travis-ci.com/user/environment-variables/#Default-Environment-Variables
  if (getEnvironmentVariable('HAS_JOSH_K_SEAL_OF_APPROVAL')) {
    return new TravisProvider();
  } else if (getEnvironmentVariable('CIRCLECI')) {
    return new CircleProvider();
  } else if (getEnvironmentVariable('GITHUB_ACTION')) {
    return new GithubActionsCIProvider();
  }
  // TODO: Add vsts and gitlab CI

  return null;
}
