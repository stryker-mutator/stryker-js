import { ConfigEditorFactory } from 'stryker-api/config';
import { TestFrameworkFactory } from 'stryker-api/test_framework';

import MochaConfigWriter from './MochaConfigWriter';
import MochaTestFramework from './MochaTestFramework';

TestFrameworkFactory.instance().register('mocha', MochaTestFramework);
ConfigEditorFactory.instance().register('mocha', MochaConfigWriter);