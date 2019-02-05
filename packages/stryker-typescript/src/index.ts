import { MutatorFactory } from 'stryker-api/mutant';
import { declareClassPlugin, PluginKind } from 'stryker-api/plugin';
import TypescriptConfigEditor from './TypescriptConfigEditor';
import TypescriptMutator from './TypescriptMutator';
import TypescriptTranspiler from './TypescriptTranspiler';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.ConfigEditor, 'typescript', TypescriptConfigEditor),
  declareClassPlugin(PluginKind.Transpiler, 'typescript', TypescriptTranspiler)
];
MutatorFactory.instance().register('typescript', TypescriptMutator);
