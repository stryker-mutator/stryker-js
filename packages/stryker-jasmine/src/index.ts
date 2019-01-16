import JasmineTestFramework from './JasmineTestFramework';
import { declareClassPlugin, PluginKind } from 'stryker-api/plugin';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.TestFramework, 'jasmine', JasmineTestFramework)
];
