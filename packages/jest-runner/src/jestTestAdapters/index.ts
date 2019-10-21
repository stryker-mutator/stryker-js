import { Logger } from '@stryker-mutator/api/logging';
import { BaseContext, commonTokens, Injector, tokens } from '@stryker-mutator/api/plugin';
import semver from 'semver';
import JestPromiseAdapter from './JestPromiseTestAdapter';
import JestTestAdapter from './JestTestAdapter';

export const JEST_VERSION_TOKEN = 'jestVersion';

export function jestTestAdapterFactory(log: Logger, jestVersion: string, injector: Injector<BaseContext>) {
  if (semver.satisfies(jestVersion, '<22.0.0')) {
    log.debug('Detected Jest below 22.0.0: %s', jestVersion);
    throw new Error('You need Jest version >= 22.0.0 to use Stryker');
  } else {
    return injector.injectClass(JestPromiseAdapter);
  }
}

jestTestAdapterFactory.inject = tokens(commonTokens.logger, JEST_VERSION_TOKEN, commonTokens.injector);
export { JestTestAdapter };
