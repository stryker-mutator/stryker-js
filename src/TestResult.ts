'use strict';

import * as _ from 'lodash';
import FileUtils from './utils/FileUtils';
import TypeUtils from './utils/TypeUtils';
import TestFile from './TestFile';
import Mutant from './Mutant';
import CoverageCollection from './CoverageCollection';

/**
 * Represents the result of a test run.
 * @constructor
 */
export default class TestResult {

  private typeUtils = new TypeUtils();
  private fileUtils = new FileUtils();
  private coverageLocation: string;
  private coverage: CoverageCollection;

  /**
   * @param sourceFiles - The list of source files which should be mutated.
   * @param testFiles - The list of test files.
   * @param nrSucceeded - The amount of tests that passed.
   * @param nrFailed - The amount of tests that failed.
   * @param timedOut - Indicates wheter a timeout occurred.
   * @param errorOccurred - Indicates wheter an error occurred.
   * @param timeSpent - The execution time of the test in milliseconds.
   */
  constructor(private sourceFiles: string[], private testFiles: TestFile[], private nrSucceeded: number, private nrFailed: number, private timedOut: boolean, private errorOccurred: boolean, private timeSpent: number) {
    this.typeUtils.expectParameterArray(sourceFiles, 'TestResult', 'sourceFiles');
    this.typeUtils.expectParameterArray(testFiles, 'TestResult', 'testFiles');
    this.typeUtils.expectParameterNumber(nrSucceeded, 'TestResult', 'nrSucceeded');
    this.typeUtils.expectParameterBoolean(timedOut, 'TestResult', 'timedOut');
    this.typeUtils.expectParameterBoolean(errorOccurred, 'errorOccurred', 'errorOccurred');
    this.typeUtils.expectParameterNumber(timeSpent, 'TestResult', 'timeSpent');

    this.coverage = {};
    this.coverageLocation = '';
  }

  /**
   * Gets if this test result covers the statement of a mutant.
   * @function
   * @param {Mutant} mutant - The Mutant which may be covered by this TestResult.
   * @returns {Boolean} True if this TestResult covers the mutant.
   */
  coversMutant(mutant: Mutant) {
    this.typeUtils.expectParameterObject(mutant, 'TestResult', 'mutant');
    var covered = true;
    var coveredFile = this.coverage[mutant.getFilename()];
    var mutantLineNumber = mutant.getLineNumber();
    var mutantColumnNumber = mutant.getColumnNumber();

    if (coveredFile) {
      _.forOwn(coveredFile.statementMap, (statement, statementId) => {
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
   * @param path - The path to the code coverage file.
   */
  setCoverageLocation(path: string) {
    this.typeUtils.expectParameterString(path, 'TestResult', 'path');
    this.coverageLocation = path;
  };

  /**
   * Gets the location of the code coverage file associated with this test result.
   * @function
   * @returns {String} The path to the code coverage file.
   */
  getCoverageLocation() {
    return this.coverageLocation;
  };

  /**
   * Sets the coverage for the tests which were ran.
   * @function
   * @param {Object} coverage - The code coverage as an lcov object.
   */
  setCoverage(coverage: CoverageCollection) {
    this.typeUtils.expectParameterObject(coverage, 'TestResult', 'coverage');
    this.coverage = coverage;
  };

  /**
   * Gets the code coverage for the tets which were ran.
   * If the code coverage has not yet been read from the file, but it does exist, then it will be read first.
   * After the code coverage file has been read, it will be removed from the file system.
   * @function
   * @returns The code coverage as a lcov object.
   */
  getCoverage() {
    if (_.isEmpty(this.coverage) && this.fileUtils.fileOrFolderExists(this.coverageLocation)) {
      var coverageString = this.fileUtils.readFile(this.coverageLocation);
      this.setCoverage(JSON.parse(coverageString));
      this.fileUtils.removeTempFile(this.coverageLocation);
    }

    return this.coverage;
  };

  /**
   * Gets if the test run was successful (no failed tests and no timeout).
   * @function
   * @returns true if the test run was successful
   */
  getAllTestsSuccessful() {
    return this.nrFailed === 0 && !this.timedOut && !this.errorOccurred;
  };

  /**
   * Gets the Array of source files which were tested.
   * @function
   * @returns The Array of source files which were tested.
   */
  getSourceFiles() {
    return this.sourceFiles;
  };

  /**
   * Gets the Array of test files which were executed.
   * @function
   * @returns {TestFile[]} The Array of test files which were executed.
   */
  getTestFiles() {
    return this.testFiles;
  };

  /**
   * Gets the number of tests which succeeded.
   * @function
   * @returns The number of tests which succeeded.
   */
  getNumberOfTestsSucceeded() {
    return this.nrSucceeded;
  };

  /**
   * Gets the number of tests which failed.
   * @function
   * @returns The number of tests which failed.
   */
  getNumberOfTestsFailed() {
    return this.nrFailed;
  };

  /**
   * Gets if a timeout occurred during the test run.
   * @function
   * @returns true if a timeout occurred.
   */
  getTimedOut() {
    return this.timedOut;
  };

  /**
   * Gets the amount of time, in milliseconds, which the test run took.
   * @function
   * @returns The amount of time, in milliseconds, which the test run took.
   */
  getTimeSpent() {
    return this.timeSpent;
  };
}