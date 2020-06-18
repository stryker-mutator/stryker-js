import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

import strykerValidationSchema from '../schema/typescript-checker-options.json';

import { TypescriptChecker } from './typescript-checker';

export const strykerPlugins = [declareClassPlugin(PluginKind.Checker, 'typescript', TypescriptChecker)];

export { strykerValidationSchema, TypescriptChecker };
