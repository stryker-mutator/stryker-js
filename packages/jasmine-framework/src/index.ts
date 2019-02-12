import JasmineTestFramework from './JasmineTestFramework';
import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.TestFramework, 'jasmine', JasmineTestFramework)
];
