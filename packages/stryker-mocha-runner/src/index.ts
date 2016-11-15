import { TestRunnerFactory } from 'stryker-api/test_runner';
import { TestFrameworkFactory } from 'stryker-api/test_framework';

import MochaTestRunner from './MochaTestRunner';
import MochaTestFramework from './MochaTestFramework';

TestRunnerFactory.instance().register('mocha', MochaTestRunner);
TestFrameworkFactory.instance().register('mocha', MochaTestFramework);