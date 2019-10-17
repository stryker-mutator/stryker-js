import { CIProvider } from './Provider';

import { getEnvironmentVariable, getEnvironmentVariableOrThrow } from '../../utils/objectUtils';

class CircleProvider implements CIProvider {
  public determineSlug(): string {
    return `${this.determineProvider()}/${this.determineRepository()}`;
  }
  public determineVersion(): string {
    return getEnvironmentVariable('CIRCLE_BRANCH') || getEnvironmentVariable('CIRCLE_TAG') || 'unknown';
  }
  public isPullRequest() {
    return getEnvironmentVariable('CIRCLE_PULL_REQUEST') !== undefined;
  }

  private determineRepository() {
    const username = getEnvironmentVariableOrThrow('CIRCLE_PROJECT_USERNAME');
    const repoName = getEnvironmentVariableOrThrow('CIRCLE_PROJECT_REPONAME');
    return `${username}/${repoName}`;
  }

  private determineProvider() {
    // Repo url can be in 2 forms:
    // - 'git@github.com:company/repo.git'
    // - 'https://github.com/company/repo'
    // See https://discuss.circleci.com/t/circle-repository-url-changed-format-in-v2/15273
    const repoUrl = getEnvironmentVariableOrThrow('CIRCLE_REPOSITORY_URL');
    if (repoUrl.startsWith('git@')) {
      return repoUrl.substr(4).split(':')[0];
    } else {
      return repoUrl.split('//')[1].split('/')[0];
    }

  }
}

export default CircleProvider;
