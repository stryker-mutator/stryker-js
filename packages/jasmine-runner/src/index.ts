import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import * as strykerValidationSchema from '../schema/jasmine-runner-options.json';

import JasmineTestRunner from './JasmineTestRunner';

export const strykerPlugins = [declareClassPlugin(PluginKind.TestRunner, 'jasmine', JasmineTestRunner)];

export { strykerValidationSchema };
