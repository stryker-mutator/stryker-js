import { getEnvironmentVariable } from '../../utils/objectUtils';
import { CIProvider } from './Provider';

/**
 * See https://docs.travis-ci.com/user/environment-variables/#default-environment-variables
 */
class TravisProvider implements CIProvider {
  public determineProject(): string | undefined {
    const slug = getEnvironmentVariable('TRAVIS_REPO_SLUG');
    if (slug) {
      return `github.com/${slug}`;
    } else {
      return undefined;
    }
  }
  public determineVersion(): string | undefined {
    return getEnvironmentVariable('TRAVIS_PULL_REQUEST_BRANCH') || getEnvironmentVariable('TRAVIS_BRANCH');
  }
}

export default TravisProvider;
