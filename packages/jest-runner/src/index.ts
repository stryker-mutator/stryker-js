import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import strykerValidationSchema from '../schema/jest-runner-options.json';

import { jestTestRunnerFactory } from './JestTestRunner';

process.env.BABEL_ENV = 'test';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'jest', jestTestRunnerFactory)];

export { strykerValidationSchema };
