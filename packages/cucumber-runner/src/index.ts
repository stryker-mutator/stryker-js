import * as fs from 'fs';
import { URL } from 'url';

import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { cucumberTestRunnerFactory } from './cucumber-test-runner.js';

export { CucumberTestRunner } from './cucumber-test-runner.js';

export const strykerValidationSchema: typeof import('../schema/cucumber-runner-options.json') =
  JSON.parse(
    fs.readFileSync(
      new URL('../schema/cucumber-runner-options.json', import.meta.url),
      'utf-8'
    )
  );

export const strykerPlugins = [
  declareFactoryPlugin(
    PluginKind.TestRunner,
    'cucumber',
    cucumberTestRunnerFactory
  ),
];
