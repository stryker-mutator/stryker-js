import { getEnvironmentVariable } from '../../utils/objectUtils';

import CircleProvider from './CircleProvider';
import TravisProvider from './TravisProvider';

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
export function determineCIProvider() {
  // By far the coolest env. variable from all those listed at
  // https://docs.travis-ci.com/user/environment-variables/#Default-Environment-Variables
  if (getEnvironmentVariable('HAS_JOSH_K_SEAL_OF_APPROVAL')) {
    return new TravisProvider();
  } else if (getEnvironmentVariable('CIRCLECI')) {
    return new CircleProvider();
  }
  // TODO: Add vsts, github actions and gitlab CI

  return null;
}
