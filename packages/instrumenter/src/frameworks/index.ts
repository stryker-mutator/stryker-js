import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

import { AngularIgnore } from './angular-ignore.js';

export const strykerPlugins = [declareClassPlugin(PluginKind.Ignore, 'angular', AngularIgnore)];

export const frameworkPluginsFileUrl = import.meta.url;
