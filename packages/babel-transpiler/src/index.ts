import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import * as strykerValidationSchema from '../schema/babel-transpiler-options.json';

import { babelTranspilerFactory } from './BabelTranspiler';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.Transpiler, 'babel', babelTranspilerFactory)];
export { strykerValidationSchema };
