import fs from 'fs';

import { PluginKind, declareFactoryPlugin } from '@stryker-mutator/api/plugin';

import { create } from './eslint-checker.js';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.Checker, 'eslint', create)];

export const strykerValidationSchema: typeof import('../schema/eslint-checker-options.json') = JSON.parse(
  fs.readFileSync(new URL('../schema/eslint-checker-options.json', import.meta.url), 'utf-8')
);

export const createLintChecker = create;
