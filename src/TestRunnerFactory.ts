'use strict';

import JasmineTestRunner from './testrunners/JasmineTestRunner';
import TestRunnerConfig from './testrunners/TestRunnerConfig';
import TypeUtils from './utils/TypeUtils';

/**
 * Represents a provider for all test runners.
 * @constructor
 */
export default class TestRunnerFactory {
  _typeUtils = new TypeUtils();

  /**
   * Gets a test runner for the provided name.
   * @function
   * @param {String} name - The name of the requested test runner.
   * @param testRunnerConfig - The config for the test runner.
   * @returns {Object} The created test runner.
   */
  getTestRunner(name: string, testRunnerConfig: TestRunnerConfig) {
    this._typeUtils.expectParameterString(name, 'TestRunnerFactory', 'name');
    this._typeUtils.expectParameterObject(testRunnerConfig, 'TestRunnerFactory', 'testRunnerConfig');

    if (!testRunnerConfig.timeoutMs) {
      console.log('testRunnerConfig has no property timeoutMs, using default.');
      testRunnerConfig.timeoutMs = 10000;
    } else if (!testRunnerConfig.timeoutFactor) {
      console.log('testRunnerConfig has no property timeoutFactor, using default.');
      testRunnerConfig.timeoutFactor = 1.25;
    } else if (!this._typeUtils.isBoolean(testRunnerConfig.individualTests)) {
      console.log('testRunnerConfig has no property individualTests, using default.');
      testRunnerConfig.individualTests = false;
    } else if (!testRunnerConfig.libs) {
      console.log('testRunnerConfig has no property libs, using default.');
      testRunnerConfig.libs = [];
    }

    switch (name) {
      case 'jasmine':
        var config = {
          port: 9876,
          browsers: ['PhantomJS'],
          singleRun: true,
          individualTests: testRunnerConfig.individualTests,
          libs: testRunnerConfig.libs
          //browserNoActivityTimeout: testRunnerConfig.timeoutMs * testRunnerConfig.timeoutFactor
        };
        var jasmine = new JasmineTestRunner(config);
        jasmine.setTimeoutMs(testRunnerConfig.timeoutMs);
        jasmine.setTimeoutFactor(testRunnerConfig.timeoutFactor);
        return jasmine;
      default:
        throw new Error('TestRunner ' + name + ' is not supported. Please check if it is spelled correctly.');
    }
  }
}
