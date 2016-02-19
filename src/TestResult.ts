'use strict';

var _ = require('lodash');
import FileUtils from './utils/FileUtils';
var TypeUtils = require('./utils/TypeUtils');

/**
 * Represents the result of a test run.
 * @constructor
 * @param {String[]} sourceFiles - The list of source files which should be mutated.
 * @param {TestFile[]} testFiles - The list of test files.
 * @param {Number} nrSucceeded - The amount of tests that passed.
 * @param {Number} nrFailed - The amount of tests that failed.
 * @param {Boolean} timedOut - Indicates wheter a timeout occurred.
 * @param {Boolean} errorOccurred - Indicates wheter an error occurred.
 * @param {Number} timeSpent - The execution time of the test in milliseconds.
 */
function TestResult(sourceFiles, testFiles, nrSucceeded, nrFailed, timedOut, errorOccurred, timeSpent) {
  this._typeUtils = new TypeUtils();
  this._typeUtils.expectParameterArray(sourceFiles, 'TestResult', 'sourceFiles');
  this._typeUtils.expectParameterArray(testFiles, 'TestResult', 'testFiles');
  this._typeUtils.expectParameterNumber(nrSucceeded, 'TestResult', 'nrSucceeded');
  this._typeUtils.expectParameterBoolean(timedOut, 'TestResult', 'timedOut');
  this._typeUtils.expectParameterBoolean(errorOccurred, 'errorOccurred', 'errorOccurred');
  this._typeUtils.expectParameterNumber(timeSpent, 'TestResult', 'timeSpent');

  this._sourceFiles = sourceFiles;
  this._testFiles = testFiles;
  this._nrSucceeded = nrSucceeded;
  this._nrFailed = nrFailed;
  this._timedOut = timedOut;
  this._errorOccurred = errorOccurred;
  this._timeSpent = timeSpent;
  this._coverage = {};
  this._coverageLocation = '';
  this._fileUtils = new FileUtils();
}

/**
 * Gets if this test result covers the statement of a mutant.
 * @function
 * @param {Mutant} mutant - The Mutant which may be covered by this TestResult.
 * @returns {Boolean} True if this TestResult covers the mutant.
 */
TestResult.prototype.coversMutant = function(mutant) {
  this._typeUtils.expectParameterObject(mutant, 'TestResult', 'mutant');
  var covered = true;
  var coveredFile = this._coverage[mutant.getFilename()];
  var mutantLineNumber = mutant.getLineNumber();
  var mutantColumnNumber = mutant.getColumnNumber();

  if (coveredFile) {
    _.forOwn(coveredFile.statementMap, function(statement, statementId) {
      if (statement.start.line <= mutantLineNumber && statement.end.line >= mutantLineNumber) {
        if ((statement.start.line === mutantLineNumber && statement.start.column > mutantColumnNumber) ||
          (statement.end.line === mutantLineNumber && statement.end.column < mutantColumnNumber) ||
          coveredFile.s[statementId] === 0) {
          covered = false;
          return false;
        }
      }
    });
  } else {
    covered = false;
  }

  return covered;
};

/**
 * Sets the location of the code coverage file associated with this test result.
 * @function
 * @param {String} path - The path to the code coverage file.
 */
TestResult.prototype.setCoverageLocation = function(path) {
  this._typeUtils.expectParameterString(path, 'TestResult', 'path');
  this._coverageLocation = path;
};

/**
 * Gets the location of the code coverage file associated with this test result.
 * @function
 * @returns {String} The path to the code coverage file.
 */
TestResult.prototype.getCoverageLocation = function() {
  return this._coverageLocation;
};

/**
 * Sets the coverage for the tests which were ran.
 * @function
 * @param {Object} coverage - The code coverage as an lcov object.
 */
TestResult.prototype.setCoverage = function(coverage) {
  this._typeUtils.expectParameterObject(coverage, 'TestResult', 'coverage');
  this._coverage = coverage;
};

/**
 * Gets the code coverage for the tets which were ran.
 * If the code coverage has not yet been read from the file, but it does exist, then it will be read first.
 * After the code coverage file has been read, it will be removed from the file system.
 * @function
 * @returns The code coverage as a lcov object.
 */
TestResult.prototype.getCoverage = function() {
  if (_.isEmpty(this._coverage) && this._fileUtils.fileOrFolderExists(this._coverageLocation)) {
    var coverageString = this._fileUtils.readFile(this._coverageLocation);
    this.setCoverage(JSON.parse(coverageString));
    this._fileUtils.removeTempFile(this._coverageLocation);
  }

  return this._coverage;
};

/**
 * Gets if the test run was successful (no failed tests and no timeout).
 * @function
 * @returns true if the test run was successful
 */
TestResult.prototype.getAllTestsSuccessful = function() {
  return this._nrFailed === 0 && !this._timedOut && !this._errorOccurred;
};

/**
 * Gets the Array of source files which were tested.
 * @function
 * @returns The Array of source files which were tested.
 */
TestResult.prototype.getSourceFiles = function() {
  return this._sourceFiles;
};

/**
 * Gets the Array of test files which were executed.
 * @function
 * @returns {TestFile[]} The Array of test files which were executed.
 */
TestResult.prototype.getTestFiles = function() {
  return this._testFiles;
};

/**
 * Gets the number of tests which succeeded.
 * @function
 * @returns The number of tests which succeeded.
 */
TestResult.prototype.getNumberOfTestsSucceeded = function() {
  return this._nrSucceeded;
};

/**
 * Gets the number of tests which failed.
 * @function
 * @returns The number of tests which failed.
 */
TestResult.prototype.getNumberOfTestsFailed = function() {
  return this._nrFailed;
};

/**
 * Gets if a timeout occurred during the test run.
 * @function
 * @returns true if a timeout occurred.
 */
TestResult.prototype.getTimedOut = function() {
  return this._timedOut;
};

/**
 * Gets the amount of time, in milliseconds, which the test run took.
 * @function
 * @returns The amount of time, in milliseconds, which the test run took.
 */
TestResult.prototype.getTimeSpent = function() {
  return this._timeSpent;
};

module.exports = TestResult;
