import JasmineTestRunner from './JasmineTestRunner';
import { declareClassPlugin, PluginKind } from 'stryker-api/plugin';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.TestRunner, 'jasmine', JasmineTestRunner)
];
