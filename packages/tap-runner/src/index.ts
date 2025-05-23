import fs from 'fs';

import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { createTapTestRunner } from './tap-test-runner.js';

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.TestRunner, 'tap', createTapTestRunner),
];

export {
  TapTestRunner,
  createTapTestRunnerFactory,
} from './tap-test-runner.js';
export const strykerValidationSchema: typeof import('../schema/tap-runner-options.json') =
  JSON.parse(
    fs.readFileSync(
      new URL('../schema/tap-runner-options.json', import.meta.url),
      'utf-8',
    ),
  );
