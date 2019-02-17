import JasmineTestRunner from './JasmineTestRunner';
import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.TestRunner, 'jasmine', JasmineTestRunner)
];
