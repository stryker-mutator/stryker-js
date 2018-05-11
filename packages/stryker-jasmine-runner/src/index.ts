import { TestRunnerFactory } from 'stryker-api/test_runner';

import JasmineTestRunner from './JasmineTestRunner';

TestRunnerFactory.instance().register('jasmine', JasmineTestRunner);