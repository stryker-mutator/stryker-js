import { getLogger } from 'log4js';

import JestTestAdapter from './JestTestAdapter';
import JestPromiseAdapter from './JestPromiseTestAdapter';
import * as semver from 'semver';

export default class JestTestAdapterFactory {
  private static log = getLogger(JestTestAdapterFactory.name);

  public static getJestTestAdapter(loader?: NodeRequire): JestTestAdapter {
    const jestVersion = this.getJestVersion(loader || /* istanbul ignore next */ require);

    if (semver.satisfies(jestVersion, '<22.0.0')) {
      JestTestAdapterFactory.log.debug(`Detected Jest below 22.0.0`);
      throw new Error('You need Jest version >= 22.0.0 to use Stryker');
    } else {
      return new JestPromiseAdapter();
    }
  }

  private static getJestVersion(loader: NodeRequire): string {
    const packageJson = loader('jest/package.json');

    return packageJson.version;
  }
}