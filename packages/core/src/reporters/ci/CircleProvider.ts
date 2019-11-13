import { getEnvironmentVariable } from '../../utils/objectUtils';

import { CIProvider } from './Provider';

class CircleProvider implements CIProvider {
  public isPullRequest = () => getEnvironmentVariable('CIRCLE_PULL_REQUEST') !== undefined;

  public determineBranch = () => getEnvironmentVariable('CIRCLE_BRANCH') || '(unknown)';

  public determineRepository = () => {
    const username = getEnvironmentVariable('CIRCLE_PROJECT_USERNAME');
    const reponame = getEnvironmentVariable('CIRCLE_PROJECT_REPONAME');
    if (username !== '' && reponame !== '') {
      return `${username}/${reponame}`;
    } else {
      return '(unknown)';
    }
  };
}

export default CircleProvider;
