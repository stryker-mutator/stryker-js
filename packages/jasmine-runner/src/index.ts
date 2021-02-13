import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import strykerValidationSchema from '../schema/jasmine-runner-options.json';

import { createJasmineTestRunner, createJasmineTestRunnerFactory, JasmineTestRunner } from './jasmine-test-runner';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'jasmine', createJasmineTestRunner)];

export { strykerValidationSchema, JasmineTestRunner, createJasmineTestRunnerFactory };
