import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

import { AngularIgnorer } from './angular-ignorer.js';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Ignore, 'angular', AngularIgnorer),
];

export const frameworkPluginsFileUrl = import.meta.url;
