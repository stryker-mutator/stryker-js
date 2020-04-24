import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { babelTranspilerFactory } from './BabelTranspiler';

export * as strykerValidationSchema from '../schema/babel-transpiler-options.json';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.Transpiler, 'babel', babelTranspilerFactory)];
