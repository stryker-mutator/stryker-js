import { TestRunnerFactory } from 'stryker-api/test_runner';

import MochaTestRunner from './MochaTestRunner';

TestRunnerFactory.instance().register('mocha', MochaTestRunner);