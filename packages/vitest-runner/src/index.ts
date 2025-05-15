import fs from 'fs';

import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { vitestTestRunnerFactory } from './vitest-test-runner.js';

export const strykerPlugins = [
  declareFactoryPlugin(
    PluginKind.TestRunner,
    'vitest',
    vitestTestRunnerFactory,
  ),
];
export const strykerValidationSchema: typeof import('../schema/vitest-runner-options.json') =
  JSON.parse(
    fs.readFileSync(
      new URL('../schema/vitest-runner-options.json', import.meta.url),
      'utf-8',
    ),
  );
