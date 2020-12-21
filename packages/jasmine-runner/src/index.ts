import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import * as strykerValidationSchema from '../schema/jasmine-runner-options.json';

import { JasmineTestRunner, createJasmineTestRunner, createJasmineTestRunnerFactory } from './jasmine-test-runner';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'jasmine', createJasmineTestRunner)];

export { strykerValidationSchema, JasmineTestRunner, createJasmineTestRunnerFactory };
