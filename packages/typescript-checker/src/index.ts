import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

import { TypescriptChecker } from './typescript-checker';

export const strykerPlugins = [declareClassPlugin(PluginKind.Checker, 'typescript', TypescriptChecker)];

export { TypescriptChecker };
