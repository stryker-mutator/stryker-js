import fs from 'fs';
import { URL } from 'url';

import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { JasmineTestRunner, createJasmineTestRunner, createJasmineTestRunnerFactory } from './jasmine-test-runner.js';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'jasmine', createJasmineTestRunner)];

export const strykerValidationSchema: typeof import('../schema/jasmine-runner-options.json') = JSON.parse(
  fs.readFileSync(new URL('../schema/jasmine-runner-options.json', import.meta.url), 'utf-8')
);

export { JasmineTestRunner, createJasmineTestRunnerFactory };
