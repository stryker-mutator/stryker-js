import { commonTokens, declareFactoryPlugin, Injector, PluginKind, tokens, TestRunnerPluginContext } from '@stryker-mutator/api/plugin';

import * as strykerValidationSchema from '../schema/mocha-runner-options.json';

import * as pluginTokens from './plugin-tokens';
import MochaOptionsLoader from './MochaOptionsLoader';
import { MochaTestRunner } from './MochaTestRunner';
import { MochaAdapter } from './MochaAdapter';

createMochaTestRunner.inject = tokens(commonTokens.injector);
export function createMochaTestRunner(injector: Injector<TestRunnerPluginContext>): MochaTestRunner {
  return injector
    .provideClass(pluginTokens.loader, MochaOptionsLoader)
    .provideClass(pluginTokens.mochaAdapter, MochaAdapter)
    .injectClass(MochaTestRunner);
}

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'mocha', createMochaTestRunner)];

export { strykerValidationSchema, MochaTestRunner };
