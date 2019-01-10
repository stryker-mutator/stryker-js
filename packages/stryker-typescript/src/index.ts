import { MutatorFactory } from 'stryker-api/mutant';
import { TranspilerFactory } from 'stryker-api/transpile';
import { pluginClass, PluginKind } from 'stryker-api/plugin';
import TypescriptConfigEditor from './TypescriptConfigEditor';
import TypescriptMutator from './TypescriptMutator';
import TypescriptTranspiler from './TypescriptTranspiler';

export const strykerPlugins = [
  pluginClass(PluginKind.ConfigEditor, 'typescript', TypescriptConfigEditor)
];
MutatorFactory.instance().register('typescript', TypescriptMutator);
TranspilerFactory.instance().register('typescript', TypescriptTranspiler);
