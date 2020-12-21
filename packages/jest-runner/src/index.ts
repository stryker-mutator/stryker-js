import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import * as strykerValidationSchema from '../schema/jest-runner-options.json';

import { mixinJestEnvironment } from './jest-plugins';
import { jestTestRunnerFactory } from './jest-test-runner';

process.env.BABEL_ENV = 'test';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'jest', jestTestRunnerFactory)];

export { strykerValidationSchema, mixinJestEnvironment };
