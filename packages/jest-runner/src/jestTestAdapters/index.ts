import JestTestAdapter from './JestTestAdapter';
import JestPromiseAdapter from './JestPromiseTestAdapter';
import semver from 'semver';
import { Injector, BaseContext, tokens, commonTokens} from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

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
export {
  JestTestAdapter
};
