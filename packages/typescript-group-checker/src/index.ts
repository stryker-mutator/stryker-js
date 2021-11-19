import { PluginKind, declareFactoryPlugin } from '@stryker-mutator/api/plugin';

import { create } from './typescript-group-checker';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.Checker, 'typescript-group', create)];
