import { TestRunnerFactory } from 'stryker-api/test_runner';
import { ConfigEditorFactory } from 'stryker-api/config';

import MochaTestRunner from './MochaTestRunner';
import MochaConfigEditor from './MochaConfigEditor';

TestRunnerFactory.instance().register('mocha', MochaTestRunner);
ConfigEditorFactory.instance().register('mocha-runner', MochaConfigEditor);
