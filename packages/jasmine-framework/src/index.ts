import JasmineTestFramework from './JasmineTestFramework';
import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';

export const STRYKER_PLUGINS = [
  declareClassPlugin(PluginKind.TestFramework, 'jasmine', JasmineTestFramework)
];
