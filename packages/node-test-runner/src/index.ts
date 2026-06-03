import fs from 'node:fs';

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

export const strykerValidationSchema: typeof import('../schema/node-test-runner-options.json') =
  JSON.parse(
    fs.readFileSync(
      new URL('../schema/node-test-runner-options.json', import.meta.url),
      'utf-8',
    ),
  );
