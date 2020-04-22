import { declareClassPlugin, declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import JestOptionsEditor from './JestOptionsEditor';
import { jestTestRunnerFactory } from './JestTestRunner';

process.env.BABEL_ENV = 'test';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.OptionsEditor, 'jest', JestOptionsEditor),
  declareFactoryPlugin(PluginKind.TestRunner, 'jest', jestTestRunnerFactory),
];
