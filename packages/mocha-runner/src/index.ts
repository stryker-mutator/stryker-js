import { commonTokens, declareFactoryPlugin, Injector, PluginKind, tokens, PluginContext } from '@stryker-mutator/api/plugin';
import { DirectoryRequireCache } from '@stryker-mutator/util';
import { INSTRUMENTER_CONSTANTS } from '@stryker-mutator/api/core';

import * as strykerValidationSchema from '../schema/mocha-runner-options.json';

import * as pluginTokens from './plugin-tokens';
import MochaOptionsLoader from './MochaOptionsLoader';
import { MochaTestRunner } from './MochaTestRunner';
import { MochaAdapter } from './MochaAdapter';

createMochaTestRunner.inject = tokens(commonTokens.injector);
export function createMochaTestRunner(injector: Injector<PluginContext>): MochaTestRunner {
  return injector
    .provideClass(pluginTokens.loader, MochaOptionsLoader)
    .provideClass(pluginTokens.mochaAdapter, MochaAdapter)
    .provideClass(pluginTokens.directoryRequireCache, DirectoryRequireCache)
    .provideValue(pluginTokens.globalNamespace, INSTRUMENTER_CONSTANTS.NAMESPACE)
    .injectClass(MochaTestRunner);
}

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'mocha', createMochaTestRunner)];

export { strykerValidationSchema, MochaTestRunner };
