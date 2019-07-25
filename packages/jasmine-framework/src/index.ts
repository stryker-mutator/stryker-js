import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import JasmineTestFramework from './JasmineTestFramework';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.TestFramework, 'jasmine', JasmineTestFramework)
];
