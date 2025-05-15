import fs from 'fs';
import { URL } from 'url';

import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import {
  createMochaTestRunner,
  createMochaTestRunnerFactory,
} from './mocha-runner-factories.js';

export { MochaTestRunner } from './mocha-test-runner.js';

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.TestRunner, 'mocha', createMochaTestRunner),
];

export const strykerValidationSchema: typeof import('../schema/mocha-runner-options.json') =
  JSON.parse(
    fs.readFileSync(
      new URL('../schema/mocha-runner-options.json', import.meta.url),
      'utf-8',
    ),
  );

export { createMochaTestRunner, createMochaTestRunnerFactory };
