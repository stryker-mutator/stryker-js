import { TestFrameworkFactory } from 'stryker-api/test_framework';
import JasmineTestFramework from './JasmineTestFramework';

TestFrameworkFactory.instance().register('jasmine', JasmineTestFramework);