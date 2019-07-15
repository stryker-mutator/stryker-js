
import MochaTestFramework from './MochaTestFramework';
import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

export const STRYKER_PLUGINS = [
  declareClassPlugin(PluginKind.TestFramework, 'mocha', MochaTestFramework)
];
