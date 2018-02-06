import { ConfigEditorFactory } from 'stryker-api/config';
import { TestRunnerFactory } from 'stryker-api/test_runner';
import JestConfigEditor from './JestConfigEditor';
import JestTestRunner from './JestTestRunner';

process.env.BABEL_ENV = 'test';

ConfigEditorFactory.instance().register('jest', JestConfigEditor);
TestRunnerFactory.instance().register('jest', JestTestRunner);