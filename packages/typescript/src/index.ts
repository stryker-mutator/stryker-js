import { declareClassPlugin, PluginKind, declareFactoryPlugin } from '@stryker-mutator/api/plugin';
import TypescriptConfigEditor from './TypescriptConfigEditor';
import { typescriptMutatorFactory } from './TypescriptMutator';
import TypescriptTranspiler from './TypescriptTranspiler';

export const STRYKER_PLUGINS = [
  declareClassPlugin(PluginKind.ConfigEditor, 'typescript', TypescriptConfigEditor),
  declareClassPlugin(PluginKind.Transpiler, 'typescript', TypescriptTranspiler),
  declareFactoryPlugin(PluginKind.Mutator, 'typescript', typescriptMutatorFactory)
];
