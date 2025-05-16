import fs from 'fs';

import { PluginKind, declareFactoryPlugin } from '@stryker-mutator/api/plugin';

import { create } from './typescript-checker.js';

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.Checker, 'typescript', create),
];

export const createTypescriptChecker = create;

export const strykerValidationSchema: typeof import('../schema/typescript-checker-options.json') =
  JSON.parse(
    fs.readFileSync(
      new URL('../schema/typescript-checker-options.json', import.meta.url),
      'utf-8',
    ),
  );
