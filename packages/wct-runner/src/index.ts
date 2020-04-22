import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import WctTestRunner from './WctTestRunner';

export const strykerPlugins = [declareClassPlugin(PluginKind.TestRunner, 'wct', WctTestRunner)];

export * as strykerValidationSchema from '../schema/wct-runner-options.json';
