import { TestRunnerFactory } from 'stryker-api/test_runner';
import JestTestRunner from './JestTestRunner';

// This is the main file loaded when stryker loads this plugin
// Report your plugin to the correct Factory

TestRunnerFactory.instance().register('jest-test-runner', JestTestRunner);
