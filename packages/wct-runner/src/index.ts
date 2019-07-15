import WctTestRunner from './WctTestRunner';
import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';

export const STRYKER_PLUGINS = [
  declareClassPlugin(PluginKind.TestRunner, 'wct', WctTestRunner)
];
