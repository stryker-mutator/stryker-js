import BabelTranspiler from './BabelTranspiler';
import { declareClassPlugin, PluginKind } from 'stryker-api/plugin';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Transpiler, 'babel', BabelTranspiler)
];
