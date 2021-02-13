import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { create } from './typescript-checker';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.Checker, 'typescript', create)];

export const createTypescriptChecker = create;
