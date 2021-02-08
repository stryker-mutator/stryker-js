import { INSTRUMENTER_CONSTANTS } from '@stryker-mutator/api/core';
import { commonTokens, Injector, PluginContext, tokens } from '@stryker-mutator/api/plugin';
import { DirectoryRequireCache } from '@stryker-mutator/util';

import { MochaAdapter } from './mocha-adapter';
import { MochaOptionsLoader } from './mocha-options-loader';
import { MochaTestRunner } from './mocha-test-runner';
import * as pluginTokens from './plugin-tokens';

export const createMochaTestRunner = createMochaTestRunnerFactory();

export function createMochaTestRunnerFactory(
  namespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE
): {
  (injector: Injector<PluginContext>): MochaTestRunner;
  inject: ['$injector'];
} {
  mochaTestRunnerFactory.inject = tokens(commonTokens.injector);
  function mochaTestRunnerFactory(injector: Injector<PluginContext>): MochaTestRunner {
    return injector
      .provideClass(pluginTokens.loader, MochaOptionsLoader)
      .provideClass(pluginTokens.mochaAdapter, MochaAdapter)
      .provideClass(pluginTokens.directoryRequireCache, DirectoryRequireCache)
      .provideValue(pluginTokens.globalNamespace, namespace)
      .injectClass(MochaTestRunner);
  }
  return mochaTestRunnerFactory;
}
