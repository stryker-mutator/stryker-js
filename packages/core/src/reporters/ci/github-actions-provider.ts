import { objectUtils } from '../../utils/object-utils.js';

import { CIProvider } from './provider.js';

/**
 * https://help.github.com/en/actions/automating-your-workflow-with-github-actions/using-environment-variables#default-environment-variables
 */
export class GithubActionsCIProvider implements CIProvider {
  public determineProject(): string {
    return `github.com/${objectUtils.getEnvironmentVariableOrThrow('GITHUB_REPOSITORY')}`;
  }
  public determineVersion(): string {
    const rawRef = objectUtils.getEnvironmentVariableOrThrow('GITHUB_REF');
    // rawRef will be in the form "refs/pull/:prNumber/merge" or "refs/heads/feat/branch-1"
    const [, type, ...name] = rawRef.split('/');
    if (type === 'pull') {
      return `PR-${name[0]}`;
    } else {
      return name.join('/');
    }
  }
}
