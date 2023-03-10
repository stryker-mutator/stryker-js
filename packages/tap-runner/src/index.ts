import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { createTapTestRunner } from './tap-test-runner.js';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'tap', createTapTestRunner)];

export { TapTestRunner, createTapTestRunnerFactory } from './tap-test-runner.js';
