import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import JasmineTestRunner from './JasmineTestRunner';

export const strykerPlugins = [declareClassPlugin(PluginKind.TestRunner, 'jasmine', JasmineTestRunner)];

export * as strykerValidationSchema from '../schema/jasmine-runner-options.json';
