import JasmineTestRunner from './JasmineTestRunner';
import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';

export const STRYKER_PLUGINS = [
  declareClassPlugin(PluginKind.TestRunner, 'jasmine', JasmineTestRunner)
];
