import { declareClassPlugin, declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import * as strykerValidationSchema from '../schema/typescript-options.json';

import TypescriptOptionsEditor from './TypescriptOptionsEditor';
import { typescriptMutatorFactory } from './TypescriptMutator';
import TypescriptTranspiler from './TypescriptTranspiler';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.OptionsEditor, 'typescript', TypescriptOptionsEditor),
  declareClassPlugin(PluginKind.Transpiler, 'typescript', TypescriptTranspiler),
  declareFactoryPlugin(PluginKind.Mutator, 'typescript', typescriptMutatorFactory)
];

export { strykerValidationSchema };
