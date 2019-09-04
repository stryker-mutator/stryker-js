
import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import MochaTestFramework from './MochaTestFramework';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.TestFramework, 'mocha', MochaTestFramework)
];
