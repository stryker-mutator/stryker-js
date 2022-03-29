import { PluginKind, declareFactoryPlugin } from '@stryker-mutator/api/plugin';

import { create } from './eslint-checker.js';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.Checker, 'eslint', create)];

export const createLintChecker = create;
