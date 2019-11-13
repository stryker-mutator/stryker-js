import { getEnvironmentVariable } from '../../utils/objectUtils';

import { CIProvider } from './Provider';

class TravisReporter implements CIProvider {
  public isPullRequest = () => getEnvironmentVariable('TRAVIS_PULL_REQUEST') !== 'false';

  public determineBranch = () => getEnvironmentVariable('TRAVIS_BRANCH') || '(unknown)';

  public determineRepository = () => getEnvironmentVariable('TRAVIS_REPO_SLUG') || '(unknown)';
}

export default TravisReporter;
