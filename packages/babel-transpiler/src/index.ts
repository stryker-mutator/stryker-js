import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import { babelTranspilerFactory } from './BabelTranspiler';

export const STRYKER_PLUGINS = [
  declareFactoryPlugin(PluginKind.Transpiler, 'babel', babelTranspilerFactory)
];
