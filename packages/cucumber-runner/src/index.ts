import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import {
  CucumberTestRunner,
  cucumberTestRunnerFactory,
} from './cucumber-test-runner';

export { CucumberTestRunner };

export const strykerPlugins = [
  declareFactoryPlugin(
    PluginKind.TestRunner,
    'cucumber',
    cucumberTestRunnerFactory
  ),
];
