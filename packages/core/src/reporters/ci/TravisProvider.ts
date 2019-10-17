import { getEnvironmentVariableOrThrow } from '../../utils/objectUtils';
import { CIProvider } from './Provider';

class TravisProvider implements CIProvider {
  public determineSlug(): string {
    return `github.com/${getEnvironmentVariableOrThrow('TRAVIS_REPO_SLUG')}`;
  }
  public determineVersion(): string {
    return getEnvironmentVariableOrThrow('TRAVIS_BRANCH');
  }

  public isPullRequest = () => getEnvironmentVariableOrThrow('TRAVIS_PULL_REQUEST') !== 'false';
}

export default TravisProvider;
