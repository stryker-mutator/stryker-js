import { declareClassPlugin, declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import TypescriptConfigEditor from './TypescriptConfigEditor';
import { typescriptMutatorFactory } from './TypescriptMutator';
import TypescriptTranspiler from './TypescriptTranspiler';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.ConfigEditor, 'typescript', TypescriptConfigEditor),
  declareClassPlugin(PluginKind.Transpiler, 'typescript', TypescriptTranspiler),
  declareFactoryPlugin(PluginKind.Mutator, 'typescript', typescriptMutatorFactory)
];
