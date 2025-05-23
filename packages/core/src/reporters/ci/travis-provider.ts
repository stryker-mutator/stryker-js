import { objectUtils } from '../../utils/object-utils.js';

import { CIProvider } from './provider.js';

/**
 * See https://docs.travis-ci.com/user/environment-variables/#default-environment-variables
 */
export class TravisProvider implements CIProvider {
  public determineProject(): string | undefined {
    const slug = objectUtils.getEnvironmentVariable('TRAVIS_REPO_SLUG');
    if (slug) {
      return `github.com/${slug}`;
    } else {
      return undefined;
    }
  }
  public determineVersion(): string | undefined {
    return (
      objectUtils.undefinedEmptyString(
        objectUtils.getEnvironmentVariable('TRAVIS_PULL_REQUEST_BRANCH'),
      ) ?? objectUtils.getEnvironmentVariable('TRAVIS_BRANCH')
    );
  }
}
