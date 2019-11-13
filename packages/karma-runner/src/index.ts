import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import KarmaTestRunner from './KarmaTestRunner';

export const strykerPlugins = [declareClassPlugin(PluginKind.TestRunner, 'karma', KarmaTestRunner)];
