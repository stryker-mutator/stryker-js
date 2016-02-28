'use strict';

import * as _ from 'lodash';
import {expect} from 'chai';
import {TestCompletedCallback} from '../../../src/testrunners/BaseTestRunner';
import JasmineTestRunner from '../../../src/testrunners/JasmineTestRunner';
import TestRunnerConfig from '../../../src/testrunners/TestRunnerConfig';
import TestFile from '../../../src/TestFile';
import TestResult from '../../../src/TestResult';
import FileUtils from '../../../src/utils/FileUtils';
require('mocha-sinon');

describe('JasmineTestRunner', function() {
  var testRunner: JasmineTestRunner;
  var sourceFiles: string[];
  var testFiles: string[];

  beforeEach(function() {
    var config = {
      individualTests: true
    };
    testRunner = new JasmineTestRunner(config);
    sourceFiles = ['a.js'];
    testFiles = ['aSpec.js'];
    this.sinon.stub(testRunner, 'test', function(config: TestRunnerConfig, sourceFiles: string[], testFiles: TestFile[], testCompletedCallback: TestCompletedCallback) {
      testCompletedCallback(new TestResult(sourceFiles, testFiles, 0, 0, false, false, 0));
    });

    this.sinon.stub(TestFile.prototype, 'save', function() {
      return 'tmp/some/file.js';
    });
  });

  it('should generate a single TestFile if a TestFile only contains one test', function(done) {
    this.sinon.stub(FileUtils.prototype, 'readFile', function(path: string) {
      return "describe('describe-1', function() {\
          it('it-1', function() {});\
        });";
    });

    testRunner.testAndCollectCoverage(sourceFiles, testFiles, function(testResults) {
      expect(testResults.length).to.equal(1);
      done();
    });
  });

  describe('should generate all TestFiles', function() {
    it('if a test file only contains one describe with multiple its', function(done) {
      this.sinon.stub(FileUtils.prototype, 'readFile', function(path: string) {
        return "describe('describe-1', function() {\
            it('it-1', function() {});\
            it('it-2', function() {});\
            it('it-3', function() {});\
          });";
      });

      testRunner.testAndCollectCoverage(sourceFiles, testFiles, function(testResults) {
        expect(testResults.length).to.equal(3);
        done();
      });
    });

    it('if a test file only contains multiple describes with multiple its', function(done) {
      this.sinon.stub(FileUtils.prototype, 'readFile', function(path: string) {
        return "describe('describe-1', function() {\
            describe('describe-2', function() {\
              it('it-1', function() {});\
              it('it-2', function() {});\
              it('it-3', function() {});\
            });\
            describe('describe-3', function() {\
              it('it-4', function() {});\
              it('it-5', function() {});\
              it('it-6', function() {});\
            });\
            it('it-7', function() {});\
            it('it-8', function() {});\
            it('it-9', function() {});\
          });";
      });

      testRunner.testAndCollectCoverage(sourceFiles, testFiles, function(testResults) {
        expect(testResults.length).to.equal(9);
        done();
      });
    });
  });

  describe('should the correct name of the test file', function() {
    it('if the it is only enclosed in a single describe', function(done) {
      var className = 'MyTest';
      var testName = 'should pass';
      this.sinon.stub(FileUtils.prototype, 'readFile', function(path: string) {
        return "describe('" + className + "', function() {\
              it('" + testName + "', function() {});\
            });";
      });

      testRunner.testAndCollectCoverage(sourceFiles, testFiles, function(testResults) {
        var testFile = testResults[0].getTestFiles()[0];
        expect(testFile.name).to.equal(className + ' ' + testName);
        done();
      });
    });

    it('if the it is enclosed in two describes', function(done) {
      var className = 'MyTest';
      var describeName = 'should pass';
      var testName = 'if everything is correct';
      this.sinon.stub(FileUtils.prototype, 'readFile', function(path: string) {
        return "describe('" + className + "', function() {\
                  describe('" + describeName + "', function() {\
                    it('" + testName + "', function() {});\
                  });\
                });";
      });

      testRunner.testAndCollectCoverage(sourceFiles, testFiles, function(testResults) {
        var testFile = testResults[0].getTestFiles()[0];
        expect(testFile.name).to.equal(className + ' ' + describeName + ' ' + testName);
        done();
      });
    });

    it('if the it is enclosed in two describes', function(done) {
      var className = 'MyTest';
      var describeName = 'should pass';
      var testName = 'if everything is correct';
      this.sinon.stub(FileUtils.prototype, 'readFile', function(path: string) {
        return "describe('" + className + "', function() {\
                  describe('should be ignored', function() {\
                    it('because we want the other describe', function() {});\
                  });\
                  \
                  describe('" + describeName + "', function() {\
                    it('" + testName + "', function() {});\
                  });\
                });";
      });

      testRunner.testAndCollectCoverage(sourceFiles, testFiles, function(testResults) {
        var testFile = testResults[1].getTestFiles()[0];
        expect(testFile.name).to.equal(className + ' ' + describeName + ' ' + testName);
        done();
      });
    });
  });
});
