import { CIProvider } from './Provider';

import { getEnvironmentVariable } from '../../utils/objectUtils';

class CircleProvider implements CIProvider {

  public determineBranch = () => getEnvironmentVariable('CIRCLE_BRANCH') || '(unknown)';

  public determineRepository = () => {
    const username = getEnvironmentVariable('CIRCLE_PROJECT_USERNAME');
    const reponame = getEnvironmentVariable('CIRCLE_PROJECT_REPONAME');
    if (username !== '' && reponame !== '') {
      return `${username}/${reponame}`;
    } else {
      return '(unknown)';
    }
  }
  public isPullRequest = () => getEnvironmentVariable('CIRCLE_PULL_REQUEST') !== undefined;
}

export default CircleProvider;
