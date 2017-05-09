import { ConfigWriterFactory } from 'stryker-api/config';
import { TestFrameworkFactory } from 'stryker-api/test_framework';

import MochaConfigWriter from './MochaConfigWriter';
import MochaTestFramework from './MochaTestFramework';

TestFrameworkFactory.instance().register('mocha', MochaTestFramework);
ConfigWriterFactory.instance().register('mocha', MochaConfigWriter);