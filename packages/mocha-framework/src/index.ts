
import MochaTestFramework from './MochaTestFramework';
import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.TestFramework, 'mocha', MochaTestFramework)
];
