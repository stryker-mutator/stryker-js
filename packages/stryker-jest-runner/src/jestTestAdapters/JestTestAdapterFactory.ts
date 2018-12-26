import * as semver from 'semver';
import { getLogger } from 'stryker-api/logging';
import JestPromiseAdapter from './JestPromiseTestAdapter';
import JestTestAdapter from './JestTestAdapter';

export default class JestTestAdapterFactory {

  public static getJestTestAdapter(loader?: NodeRequire): JestTestAdapter {
    const jestVersion = this.getJestVersion(loader || /* istanbul ignore next */ require);

    if (semver.satisfies(jestVersion, '<22.0.0')) {
      JestTestAdapterFactory.log.debug('Detected Jest below 22.0.0');
      throw new Error('You need Jest version >= 22.0.0 to use Stryker');
    } else {
      return new JestPromiseAdapter();
    }
  }
  private static readonly log = getLogger(JestTestAdapterFactory.name);

  private static getJestVersion(loader: NodeRequire): string {
    const packageJson = loader('jest/package.json');

    return packageJson.version;
  }
}
