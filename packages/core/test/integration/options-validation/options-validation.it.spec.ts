import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import { commonTokens } from '@stryker-mutator/api/plugin';

import { createPluginResolverInjector } from '../../../src/di';
import { resolveFromRoot } from '../../helpers/testUtils';

import sinon = require('sinon');

describe('Options validation integration', () => {
  it('should log about unknown properties in log file', () => {
    const optionsProvider = createPluginResolverInjector(
      {
        configFile: resolveFromRoot('testResources', 'options-validation', 'excess-options.conf.json'),
      },
      testInjector.injector
    );
    optionsProvider.resolve(commonTokens.options);
    expect(testInjector.logger.warn).calledWithMatch(sinon.match('Unknown stryker config option "this is an excess property")'));
  });
});
