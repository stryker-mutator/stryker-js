import fs from 'fs';
import { URL } from 'url';

import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { mixinJestEnvironment } from './jest-plugins/index.js';
import { jestTestRunnerFactory } from './jest-test-runner.js';

process.env.BABEL_ENV = 'test';

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.TestRunner, 'jest', jestTestRunnerFactory),
];

export const strykerValidationSchema: typeof import('../schema/jest-runner-options.json') =
  JSON.parse(
    fs.readFileSync(
      new URL('../schema/jest-runner-options.json', import.meta.url),
      'utf-8',
    ),
  );

export { mixinJestEnvironment };
