import { INSTRUMENTER_CONSTANTS } from '@stryker-mutator/api/core';
import { commonTokens, Injector, PluginContext, tokens } from '@stryker-mutator/api/plugin';
import { DirectoryRequireCache } from '@stryker-mutator/util';

import { MochaAdapter } from './MochaAdapter';
import MochaOptionsLoader from './MochaOptionsLoader';
import { MochaTestRunner } from './MochaTestRunner';
import * as pluginTokens from './plugin-tokens';

export const createMochaTestRunner = createMochaTestRunnerFactory();

export function createMochaTestRunnerFactory(namespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE) {
  createMochaTestRunner.inject = tokens(commonTokens.injector);
  function createMochaTestRunner(injector: Injector<PluginContext>): MochaTestRunner {
    return injector
      .provideClass(pluginTokens.loader, MochaOptionsLoader)
      .provideClass(pluginTokens.mochaAdapter, MochaAdapter)
      .provideClass(pluginTokens.directoryRequireCache, DirectoryRequireCache)
      .provideValue(pluginTokens.globalNamespace, namespace)
      .injectClass(MochaTestRunner);
  }
  return createMochaTestRunner;
}
