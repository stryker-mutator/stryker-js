import { PluginKind, declareFactoryPlugin } from '@stryker-mutator/api/plugin';

import { create } from './typescript-checker.js';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.Checker, 'typescript', create)];

export const createTypescriptChecker = create;
