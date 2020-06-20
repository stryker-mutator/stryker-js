import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import * as strykerValidationSchema from '../schema/karma-runner-options.json';

import KarmaTestRunner from './KarmaTestRunner';

export const strykerPlugins = [declareClassPlugin(PluginKind.TestRunner2, 'karma', KarmaTestRunner)];
export { strykerValidationSchema };
