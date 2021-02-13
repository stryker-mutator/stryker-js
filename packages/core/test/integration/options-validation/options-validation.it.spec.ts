import { commonTokens } from '@stryker-mutator/api/plugin';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { coreTokens, createPluginResolverProvider } from '../../../src/di';
import { resolveFromRoot } from '../../helpers/test-utils';

describe('Options validation integration', () => {
  it('should log about unknown properties in log file', () => {
    const optionsProvider = createPluginResolverProvider(
      testInjector.injector.provideValue(coreTokens.cliOptions, {
        configFile: resolveFromRoot('testResources', 'options-validation', 'unknown-options.conf.json'),
      })
    );
    optionsProvider.resolve(commonTokens.options);
    expect(testInjector.logger.warn).calledWithMatch(sinon.match('Unknown stryker config option "this is an unknown property"'));
  });
});
