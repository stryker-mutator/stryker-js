import KarmaTestRunner from './KarmaTestRunner';
import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';

export const STRYKER_PLUGINS = [
  declareClassPlugin(PluginKind.TestRunner, 'karma', KarmaTestRunner)
];
