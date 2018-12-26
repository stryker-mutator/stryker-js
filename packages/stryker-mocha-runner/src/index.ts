import { ConfigEditorFactory } from 'stryker-api/config';
import { TestRunnerFactory } from 'stryker-api/test_runner';
import MochaConfigEditor from './MochaConfigEditor';
import MochaTestRunner from './MochaTestRunner';

TestRunnerFactory.instance().register('mocha', MochaTestRunner);
ConfigEditorFactory.instance().register('mocha-runner', MochaConfigEditor);
