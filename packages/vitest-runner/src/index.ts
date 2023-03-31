import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { vitestTestRunnerFactory } from './vitest-test-runner.js';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'vitest', vitestTestRunnerFactory)];
