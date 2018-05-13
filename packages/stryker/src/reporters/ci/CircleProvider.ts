import { CiProvider } from './Provider';

import { getEnvironmentVariable } from '../../utils/objectUtils';

class CircleProvider implements CiProvider {
  isPullRequest = () => getEnvironmentVariable('CIRCLE_PULL_REQUEST') !== undefined;

  determineBranch = () => getEnvironmentVariable('CIRCLE_BRANCH') || '(unknown)';

  determineRepository = () => {
    const username = getEnvironmentVariable('CIRCLE_PROJECT_USERNAME');
    const reponame = getEnvironmentVariable('CIRCLE_PROJECT_REPONAME');
    if (username !== '' && reponame !== '') {
      return `${username}/${reponame}`;
    } else {
      return '(unknown)';
    }
  }
}

export default CircleProvider;
