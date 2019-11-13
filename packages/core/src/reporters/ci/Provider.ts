import { getEnvironmentVariable } from '../../utils/objectUtils';

import CircleProvider from './CircleProvider';
import TravisProvider from './TravisProvider';

/**
 * Represents an object that can provide information about a CI/CD provider.
 */
export interface CIProvider {
  /** Returns whether Stryker is running on a pull request. */
  isPullRequest(): boolean;
  /** Returns the name of the Git branch of the project on which Stryker is running. */
  determineBranch(): string;
  /** Returns the name of the GitHub repository of the project on which Stryker is running. */
  determineRepository(): string;
}

/**
 * Return an approriate instance of CiProvider.
 * @returns An instance of CiProvider, or undefined if it appears Stryker is not running in a CI/CD environment.
 */
export function determineCIProvider() {
  // By far the coolest env. variable from all those listed at
  // https://docs.travis-ci.com/user/environment-variables/#Default-Environment-Variables
  if (getEnvironmentVariable('HAS_JOSH_K_SEAL_OF_APPROVAL')) {
    return new TravisProvider();
  } else if (getEnvironmentVariable('CIRCLECI')) {
    return new CircleProvider();
  }

  return undefined;
}
