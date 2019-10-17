import CircleProvider from './CircleProvider';
import TravisProvider from './TravisProvider';

import { getEnvironmentVariable } from '../../utils/objectUtils';

/**
 * Represents an object that can provide information about a CI/CD provider.
 */
export interface CIProvider {

  /**
   * Returns whether Stryker is running on a pull request.
   */
  isPullRequest(): boolean;
  /**
   * Determine the repository slug, including the git provider. I.E: github.com/stryker-mutator/stryker or bitbucket.org/org/name.
   */
   determineSlug(): string;
  /**
   * Determine the current version. I.e. branch name, git sha, or tag name
   */
  determineVersion(): string;
}

export function determineCIProvider(): CIProvider | null {
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
