import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { tapTestRunnerFactory } from './tap-test-runner.js';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'tap', tapTestRunnerFactory)];

export { TapTestRunner } from './tap-test-runner.js';
