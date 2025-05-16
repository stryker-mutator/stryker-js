import { URL } from 'url';
import fs from 'fs';

import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { createKarmaTestRunner } from './karma-test-runner.js';

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.TestRunner, 'karma', createKarmaTestRunner),
];
export const strykerValidationSchema: typeof import('../schema/karma-runner-options.json') =
  JSON.parse(
    fs.readFileSync(
      new URL('../schema/karma-runner-options.json', import.meta.url),
      'utf-8',
    ),
  );
