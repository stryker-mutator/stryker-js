import { ConfigEditorFactory } from 'stryker-api/config';
import { TestFrameworkFactory } from 'stryker-api/test_framework';

import MochaConfigEditor from './MochaConfigEditor';
import MochaTestFramework from './MochaTestFramework';

TestFrameworkFactory.instance().register('mocha', MochaTestFramework);
ConfigEditorFactory.instance().register('mocha', MochaConfigEditor);