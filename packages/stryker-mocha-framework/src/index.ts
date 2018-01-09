import { TestFrameworkFactory } from 'stryker-api/test_framework';

import MochaTestFramework from './MochaTestFramework';

TestFrameworkFactory.instance().register('mocha', MochaTestFramework);