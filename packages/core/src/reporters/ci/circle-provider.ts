import { getEnvironmentVariable, getEnvironmentVariableOrThrow, undefinedEmptyString } from '../../utils/object-utils';

import { CIProvider } from './provider';

/**
 * https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables
 */
export class CircleProvider implements CIProvider {
  public determineProject(): string {
    return `${this.determineProvider()}/${this.determineRepository()}`;
  }
  public determineVersion(): string | undefined {
    return (
      undefinedEmptyString(getEnvironmentVariable('CIRCLE_PR_NUMBER')) ??
      undefinedEmptyString(getEnvironmentVariable('CIRCLE_BRANCH')) ??
      undefinedEmptyString(getEnvironmentVariable('CIRCLE_TAG'))
    );
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
