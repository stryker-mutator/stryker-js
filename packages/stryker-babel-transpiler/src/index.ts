import { declareFactoryPlugin, PluginKind } from 'stryker-api/plugin';
import { babelTranspilerFactory } from './BabelTranspiler';

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.Transpiler, 'babel', babelTranspilerFactory)
];
