import WctTestRunner from './WctTestRunner';
import { declareClassPlugin, PluginKind } from 'stryker-api/plugin';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.TestRunner, 'wct', WctTestRunner)
];
