import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import strykerValidationSchema from '../schema/mocha-runner-options.json';

import { createMochaTestRunner, createMochaTestRunnerFactory } from './mocha-runner-factories';
import { MochaTestRunner } from './mocha-test-runner';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'mocha', createMochaTestRunner)];

export { strykerValidationSchema, MochaTestRunner, createMochaTestRunnerFactory };
