import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { babelTranspilerFactory } from './BabelTranspiler';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.Transpiler, 'babel', babelTranspilerFactory)];
