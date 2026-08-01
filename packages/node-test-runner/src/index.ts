import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { createNodeTestRunner } from './node-test-test-runner.js';

export const strykerPlugins = [
  declareFactoryPlugin(
    PluginKind.TestRunner,
    'node-test',
    createNodeTestRunner,
  ),
];

export {
  NodeTestRunner,
  createNodeTestRunnerFactory,
} from './node-test-test-runner.js';

export { default as strykerValidationSchema } from '../schema/node-test-runner-options.json' with { type: 'json' };
