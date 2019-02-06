import ES5Mutator from './ES5Mutator';
import { declareClassPlugin, PluginKind } from 'stryker-api/plugin';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Mutator, 'es5', ES5Mutator)
];
