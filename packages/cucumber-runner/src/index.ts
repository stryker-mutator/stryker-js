import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import strykerValidationSchema from '../schema/cucumber-runner-options.json';

import {
  CucumberTestRunner,
  cucumberTestRunnerFactory,
} from './cucumber-test-runner';

export { CucumberTestRunner, strykerValidationSchema };

export const strykerPlugins = [
  declareFactoryPlugin(
    PluginKind.TestRunner,
    'cucumber',
    cucumberTestRunnerFactory
  ),
];
