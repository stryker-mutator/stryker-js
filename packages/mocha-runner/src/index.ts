import { declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import * as strykerValidationSchema from '../schema/mocha-runner-options.json';

import { createMochaTestRunner, createMochaTestRunnerFactory } from './mochaRunnerFactories';
import { MochaTestRunner } from './MochaTestRunner';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.TestRunner, 'mocha', createMochaTestRunner)];

export { strykerValidationSchema, MochaTestRunner, createMochaTestRunnerFactory };
