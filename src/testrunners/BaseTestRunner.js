'use strict';

var _ = require('lodash');
var TestFile = require('../TestFile');
var TypeUtils = require('../utils/TypeUtils');

/**
 * Represents the base test runner as a blueprint for all test runners.
 * @param {Object} config - The configuration for the test runner.
 * @constructor
 */
function BaseTestRunner(config) {
  this._typeUtils = new TypeUtils();
  this._typeUtils.expectParameterObject(config, 'BaseTestRunner', 'config');

  this._config = config;
  this._baseTimeout = 0;
  this._timeoutMs = 0;
  this._timeoutFactor = 1.0;
  this._testQueue = [];
  this._queuedTestsRunning = 0;
  this._maxQueuedTests = 5;
}

/**
 * Callback for when the test run has been completed.
 * @callback BaseTestRunner~testCompletedCallback
 * @param {TestResult[]} results - The Array of TestResults of the test run.
 */

/**
 * Executes tests on the provided source files.
 * @function
 * @param {Object} config - The configuration for this test run.
 * @param {String[]} sourceFiles - The names of the files which should be tested.
 * @param {TestFile[]} testFiles - The tests which should be executed.
 * @param {BaseTestRunner~testCompletedCallback} testCompletedCallback - The callback which is called when the test has been completed.
 */
BaseTestRunner.prototype.test = function(config, sourceFiles, testFiles, testCompletedCallback) {
  this._typeUtils.expectParameterObject(config, 'BaseTestRunner', 'config');
  this._typeUtils.expectParameterArray(sourceFiles, 'BaseTestRunner', 'sourceFiles');
  this._typeUtils.expectParameterArray(testFiles, 'BaseTestRunner', 'testFiles');
  this._typeUtils.expectParameterFunction(testCompletedCallback, 'BaseTestRunner', 'testCompletedCallback');
};

/**
 * Queues a test for execution on the provided source files.
 * @function
 * @param {Object} config - The configuration for the test run.
 * @param {String[]} sourceFiles - The names of the files which should be tested.
 * @param {TestFile[]} testFiles - The tests which should be executed.
 * @param {BaseTestRunner~testCompletedCallback} testCompletedCallback - The callback which is called when the test has been completed.
 */
BaseTestRunner.prototype.queueTest = function(config, sourceFiles, testFiles, testCompletedCallback) {
  this._typeUtils.expectParameterObject(config, 'BaseTestRunner', 'config');
  this._typeUtils.expectParameterArray(sourceFiles, 'BaseTestRunner', 'sourceFiles');
  this._typeUtils.expectParameterArray(testFiles, 'BaseTestRunner', 'testFiles');
  this._typeUtils.expectParameterFunction(testCompletedCallback, 'BaseTestRunner', 'testCompletedCallback');

  var queuedTest = {
    config: config,
    src: sourceFiles,
    tests: testFiles,
    completedCb: testCompletedCallback
  };
  this._testQueue.push(queuedTest);
  this.tryRunningNextQueuedTest();
};

/**
 * Attempts to run the next queued test, if the limit of the number of queued tests is not already reached.
 * @function
 */
BaseTestRunner.prototype.tryRunningNextQueuedTest = function() {
  var that = this;

  if (this._queuedTestsRunning < this._maxQueuedTests && this._testQueue.length > 0) {
    this._queuedTestsRunning++;
    var queuedTest = _.pullAt(this._testQueue, 0)[0];
    this.test(queuedTest.config, queuedTest.src, queuedTest.tests, function(testResult) {
      queuedTest.completedCb(testResult);
      that._queuedTestsRunning--;
      that.tryRunningNextQueuedTest();
    });
  }
};

/**
 * Generates TestFile instances based on a list of paths to test files.
 * @function
 * @param {String[]} testFiles - The list of test files which have to be turned into TestFile instances.
 * @returns {TestFile[]} The generated TestFiles.
 */
BaseTestRunner.prototype._generateTestFiles = function(testFiles) {
  this._typeUtils.expectParameterArray(testFiles, 'BaseTestRunner', 'testFiles');

  var testsToRun = [];

  if (this._config.individualTests) {
    testsToRun = this._splitTests(testFiles);
  } else {
    testsToRun = _.map(testFiles, function(testFile) {
      return new TestFile(testFile);
    });
  }

  return testsToRun;
};



/**
 * Splits a test file into a set of TestFiles which each contain only one test.
 * @function
 * @param {String} testFile - The name of the test file which has to be split.
 * @returns {TestFile[]} The tests in which the testFile was split.
 */
BaseTestRunner.prototype._splitTest = function(testFile) {
  this._typeUtils.expectParameterString(testFile, 'BaseTestRunner', 'testFile');
};

/**
 * Splits an array of test files into a set of TestFiles which each contain only one test.
 * @function
 * @param {String[]} testFiles - The list of test files which have to be split.
 * @returns {TestFile[]} The tests in which the testFile was split.
 */
BaseTestRunner.prototype._splitTests = function(testFiles) {
  this._typeUtils.expectParameterArray(testFiles, 'BaseTestRunner', 'testFiles');
  var that = this;
  var individualTests = [];

  _.forEach(testFiles, function(testFile) {
    individualTests = individualTests.concat(that._splitTest(testFile));
  });

  return individualTests;
};

/**
 * Executes tests on the provided source files and collects the code coverage.
 * @function
 * @param {String[]} sourceFiles - The names of the files which should be tested.
 * @param {String[]} testFiles - The names of the tests which should be executed.
 * @param {BaseTestRunner~testCompletedCallback} testCompletedCallback - The callback which is called when the test has been completed.
 */
BaseTestRunner.prototype.testAndCollectCoverage = function(sourceFiles, testFiles, testCompletedCallback) {
  this._typeUtils.expectParameterArray(sourceFiles, 'BaseTestRunner', 'sourceFiles');
  this._typeUtils.expectParameterArray(testFiles, 'BaseTestRunner', 'testFiles');
  this._typeUtils.expectParameterFunction(testCompletedCallback, 'BaseTestRunner', 'testCompletedCallback');
};

/**
 * Callback for when a single Mutant has been tested.
 * @callback BaseTestRunner~singleMutantTestedCallback
 * @param {Mutant} testedMutant - The mutant which has been tested.
 */

/**
 * Callback for when all Mutants have been tested.
 * @callback BaseTestRunner~allMutantsTestedCallback
 * @param {Mutant[]} testedMutants - The array of Mutants which have been tested.
 */

/**
 * Tests a set of mutants to see if the test suite can detect them.
 * @function
 * @param {Mutant[]} mutants - The array with Mutant objects which have to be tested.
 * @param {String[]} sourceFiles - The list of source files without mutations.
 * @param {TestResult[]} testResults - The list of test results from the original test run.
 * @param {Stryker~singleMutantTestedCallback} singleMutantTestedCallback - The callback which is called when one Mutant have been tested.
 * @param {Stryker~allMutantsTestedCallback} allMutantsTestedCallback - The callback which is called when all Mutants have been tested.
 */
BaseTestRunner.prototype.testMutants = function(mutants, sourceFiles, testResults, singleMutantTestedCallback, allMutantsTestedCallback) {
  this._typeUtils.expectParameterArray(mutants, 'BaseTestRunner', 'mutants');
  this._typeUtils.expectParameterArray(sourceFiles, 'BaseTestRunner', 'sourceFiles');
  this._typeUtils.expectParameterArray(testResults, 'BaseTestRunner', 'testResults');
  this._typeUtils.expectParameterFunction(singleMutantTestedCallback, 'BaseTestRunner', 'singleMutantTestedCallback');
  this._typeUtils.expectParameterFunction(allMutantsTestedCallback, 'BaseTestRunner', 'allMutantsTestedCallback');
  var that = this;
  var mutantsTested = 0;

  var testResultsWithCoverage = this._waitForCodeCoverage(testResults);

  console.log('INFO: Testing mutants:');
  _.forEach(mutants, function(mutant) {
    var mutatedSrc = mutant.insertMutatedFile(sourceFiles);

    var baseTimeout = 0;
    var testFiles = [];
    _.forEach(testResultsWithCoverage, function(testResult) {
      if (testResult.coversMutant(mutant)) {
        testFiles = testFiles.concat(testResult.getTestFiles());
        baseTimeout += testResult.getTimeSpent();
      }
    });
    testFiles = _.uniq(testFiles);
    that.setBaseTimeout(baseTimeout);

    var config = _.cloneDeep(that._config);
    that.queueTest(config, mutatedSrc, testFiles, function(result) {
      mutant.setTestsRan(testFiles);

      if (result.getTimedOut()) {
        mutant.setStatusTimedOut();
      } else if (!result.getAllTestsSuccessful()) {
        mutant.setStatusKilled();
      } else if (testFiles.length > 0) {
        mutant.setStatusSurvived();
      }

      mutant.remove();
      singleMutantTestedCallback(mutant);
      mutantsTested++;
      // Checking against `mutantsTested` instead of the index because test runs MAY finish in a random order.
      if (mutants.length === mutantsTested) {
        allMutantsTestedCallback(mutants);
      }
    });
  });
};

BaseTestRunner.prototype._waitForCodeCoverage = function(testResults) {
  this._typeUtils.expectParameterArray(testResults, 'BaseTestRunner', 'testResults');
  var testResultsWithCoverage = [];
  var checkIfCoverageExists = function(testResult, index) {
    if (!_.isEmpty(testResult.getCoverage())) {
      testResultsWithCoverage.push(testResult);
      testResults.splice(index, 1);
    }
  };

  console.log('INFO: Waiting for all code coverage reports to finish');
  while (testResults.length > 0) {
    _.forEachRight(testResults, checkIfCoverageExists);
  }
  console.log('INFO: All code coverage reports have been collected');
  return testResultsWithCoverage;
};

/**
 * Sets the base timeout in milliseconds.
 * @function
 * @param {Number} timeout - The new base timeout in milliseconds.
 */
BaseTestRunner.prototype.setBaseTimeout = function(baseTimeout) {
  this._typeUtils.expectParameterNumber(baseTimeout, 'BaseTestRunner', 'baseTimeout');
  this._baseTimeout = Number(baseTimeout);
};

/**
 * Gets the base timeout in milliseconds.
 * @function
 * @returns {Number} The base timeout in milliseconds.
 */
BaseTestRunner.prototype.getBaseTimeout = function() {
  return this._baseTimeout;
};

/**
 * Sets the timeout in milliseconds which should be applied on top of the base timeout.
 * @function
 * @param {Number} timeoutMs - The new timeout in milliseconds.
 */
BaseTestRunner.prototype.setTimeoutMs = function(timeoutMs) {
  this._typeUtils.expectParameterNumber(timeoutMs, 'BaseTestRunner', 'timeoutMs');
  this._timeoutMs = Number(timeoutMs);
};

/**
 * Gets the timeout in milliseconds which is applied on top of the base timeout.
 * @function
 * @returns {Number} The timeout in milliseconds.
 */
BaseTestRunner.prototype.getTimeoutMs = function() {
  return this._timeoutMs;
};

/**
 * Sets the factor which should be applied on top of the base timeout and timeout in milliseconds.
 * @function
 * @param {Number} timeoutFactor - The new timeout factor.
 */
BaseTestRunner.prototype.setTimeoutFactor = function(timeoutFactor) {
  this._typeUtils.expectParameterNumber(timeoutFactor, 'BaseTestRunner', 'timeoutFactor');
  this._timeoutFactor = Number(timeoutFactor);
};

/**
 * Gets the timeout factor.
 * @function
 * @returns {Number} The timeout factor.
 */
BaseTestRunner.prototype.getTimeoutFactor = function() {
  return this._timeoutFactor;
};

/**
 * Gets the total timeout. Combines all other timeouts.
 * @function
 * @returns {Number} The total timeout in milliseconds.
 */
BaseTestRunner.prototype.getTotalTimeout = function() {
  return (this._baseTimeout + this._timeoutMs) * this._timeoutFactor;
};

module.exports = BaseTestRunner;
