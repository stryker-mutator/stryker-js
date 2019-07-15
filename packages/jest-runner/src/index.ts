import { PluginKind, declareClassPlugin, declareFactoryPlugin } from '@stryker-mutator/api/plugin';
import JestConfigEditor from './JestConfigEditor';
import { jestTestRunnerFactory } from './JestTestRunner';

process.env.BABEL_ENV = 'test';

export const STRYKER_PLUGINS = [
  declareClassPlugin(PluginKind.ConfigEditor, 'jest', JestConfigEditor),
  declareFactoryPlugin(PluginKind.TestRunner, 'jest', jestTestRunnerFactory)
];
