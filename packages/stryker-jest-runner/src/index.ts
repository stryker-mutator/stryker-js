import { PluginKind, declareClassPlugin } from 'stryker-api/plugin';
import { TestRunnerFactory } from 'stryker-api/test_runner';
import JestConfigEditor from './JestConfigEditor';
import JestTestRunner from './JestTestRunner';

process.env.BABEL_ENV = 'test';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.ConfigEditor, 'jest', JestConfigEditor)
];
TestRunnerFactory.instance().register('jest', JestTestRunner);
