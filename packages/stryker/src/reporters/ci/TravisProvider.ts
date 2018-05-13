import { CiProvider } from './Provider';

import { getEnvironmentVariable } from '../../utils/objectUtils';

class TravisReporter implements CiProvider {
  isPullRequest = () => getEnvironmentVariable('TRAVIS_PULL_REQUEST') !== 'false';

  determineBranch = () => getEnvironmentVariable('TRAVIS_BRANCH') || '(unknown)';

  determineRepository = () => getEnvironmentVariable('TRAVIS_REPO_SLUG') || '(unknown)';
}

export default TravisReporter;
