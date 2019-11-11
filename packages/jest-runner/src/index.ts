import { declareClassPlugin, declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import JestConfigEditor from './JestConfigEditor';
import { jestTestRunnerFactory } from './JestTestRunner';

process.env.BABEL_ENV = 'test';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.ConfigEditor, 'jest', JestConfigEditor),
  declareFactoryPlugin(PluginKind.TestRunner, 'jest', jestTestRunnerFactory)
];
