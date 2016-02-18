'use strict';

var _ = require('lodash');
var fork = require('child_process').fork;
var path = require('path');
var util = require('util');
var Server = require('karma').Server;
import BaseTestRunner from './BaseTestRunner';
var FileUtils = require('../utils/FileUtils');
var TestFile = require('../TestFile');
var TestResult = require('../TestResult');

/**
 * Represents a test runner for Jasmine tests using Karma.
 * @constructor
 * @param {Object} config - The configuration for the test runner.
 */
function KarmaTestRunner(config) {
  BaseTestRunner.call(this, config);

  this._fileUtils = new FileUtils();
}

util.inherits(KarmaTestRunner, BaseTestRunner);

KarmaTestRunner.prototype.test = function(config, sourceFiles, testFiles, testCompletedCallback) {
  BaseTestRunner.prototype.test.call(this, config, sourceFiles, testFiles, testCompletedCallback);

  if (testFiles.length > 0) {
    config.files = sourceFiles.concat(config.libs, _.map(testFiles, function(testFile) {
      return testFile.getPath();
    }));

    config.browserNoActivityTimeout = this.getTotalTimeout();

    var serverProcess = fork(__dirname + '/KarmaServerWorker.js', {
      silent: true
    });

    serverProcess.on('message', function(result) {
      var testResult = new TestResult(sourceFiles, testFiles, result.success, result.failed, result.disconnected, result.error, result.timeSpent);
      testCompletedCallback(testResult);
    });
    serverProcess.stdout.on('data', function(data) {
      // Do nothing. Workaround which prevents Stryker from getting stuck while testing mutants on several devices.
      // This problem does not occur when the childprocess is run using the option `silent: false` or if the stdout is redirected as this function is doing.
    });

    serverProcess.send(config);

  } else {
    var testResult = new TestResult(sourceFiles, testFiles, 0, 0, false, false, 0);
    testCompletedCallback(testResult);
  }
};

KarmaTestRunner.prototype._splitTest = function(testFile) {
  BaseTestRunner.prototype._splitTest.call(this, testFile);
};

KarmaTestRunner.prototype.testAndCollectCoverage = function(sourceFiles, testFiles, testCompletedCallback) {
  BaseTestRunner.prototype.testAndCollectCoverage.call(this, sourceFiles, testFiles, testCompletedCallback);
  var dirname = this._fileUtils.getBaseTempFolder();
  var subdir = 'coverage';

  this._config.reporters = ['coverage'];
  this._config.preprocessors = {};
  _.forEach(sourceFiles, function(sourceFile) {
    this._config.preprocessors[sourceFile] = ['coverage'];
  }, this);

  var that = this;
  var testsCompleted = 0;
  var testResults = [];

  var testsToRun = this._generateTestFiles(testFiles);

  _.forEach(testsToRun, function(testFile, index) {
    var config = _.cloneDeep(that._config);
    config.coverageReporter = {
      type: 'json',
      dir: dirname,
      subdir: subdir + index
    };

    var coverageFilename = dirname + path.sep + subdir + index + path.sep + 'coverage-final.json';
    that.queueTest(config, sourceFiles, [testFile], function(result) {
      result.setCoverageLocation(coverageFilename);
      testResults.push(result);
      testsCompleted++;

      if (testsCompleted === testsToRun.length) {
        delete that._config.reporters;
        delete that._config.coverageReporter;
        delete that._config.preprocessors;
        testCompletedCallback(testResults);
      }
    });
  });
};

module.exports = KarmaTestRunner;
