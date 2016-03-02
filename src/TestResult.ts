'use strict';

import * as _ from 'lodash';
import FileUtils from './utils/FileUtils';
import Mutant from './Mutant';
import TestFile from './TestFile';
import {CoverageCollection} from './api/CoverageResult';

/**
 * Represents the result of a test run.
 * @constructor
 */
export default class TestResult {
  private _fileUtils = new FileUtils();
  private _coverage: CoverageCollection;
  private _sourceFiles: string[];
  private _testFiles: TestFile[];
  private _timedOut: boolean;
  private _timeSpent: number;
  public coverageLocation: string;

  set coverage(coverage: CoverageCollection) {
    this._coverage = coverage;
  };

  get coverage() {
    if (_.isEmpty(this._coverage) && this._fileUtils.fileOrFolderExists(this.coverageLocation)) {
      var coverageString = this._fileUtils.readFile(this.coverageLocation);
      this.coverage = JSON.parse(coverageString);
      this._fileUtils.removeTempFile(this.coverageLocation);
    }

    return this._coverage;
  };

  get allTestsSuccessful() {
    return this.nrFailed === 0 && !this._timedOut && !this.errorOccurred;
  };

  get sourceFiles() {
    return this._sourceFiles;
  };

  get testFiles() {
    return this._testFiles;
  };

  get numberOfTestsSucceeded() {
    return this.nrSucceeded;
  };

  get numberOfTestsFailed() {
    return this.nrFailed;
  };

  get timedOut() {
    return this._timedOut;
  };

  get timeSpent() {
    return this._timeSpent;
  };

  /**
   * @param sourceFiles - The list of source files which should be mutated.
   * @param testFiles - The list of test files.
   * @param nrSucceeded - The amount of tests that passed.
   * @param nrFailed - The amount of tests that failed.
   * @param timedOut - Indicates wheter a timeout occurred.
   * @param errorOccurred - Indicates wheter an error occurred.
   * @param timeSpent - The execution time of the test in milliseconds.
   */
  constructor(sourceFiles: string[], testFiles: TestFile[], private nrSucceeded: number, private nrFailed: number, timedOut: boolean, private errorOccurred: boolean, timeSpent: number) {
    this._sourceFiles = sourceFiles;
    this._testFiles = testFiles;
    this._timedOut = timedOut;
    this._timeSpent = timeSpent;
    this._coverage = {};
    this.coverageLocation = '';
  }

  /**
   * Gets if this test result covers the statement of a mutant.
   * @function
   * @param {Mutant} mutant - The Mutant which may be covered by this TestResult.
   * @returns {Boolean} True if this TestResult covers the mutant.
   */
  coversMutant(mutant: Mutant) {
    var covered = true;
    var coveredFile = this._coverage[mutant.filename];

    if (coveredFile) {
      _.forOwn(coveredFile.statementMap, (statement, statementId) => {
        if (statement.start.line <= mutant.lineNumber && statement.end.line >= mutant.lineNumber) {
          if ((statement.start.line === mutant.lineNumber && statement.start.column > mutant.columnNumber) ||
            (statement.end.line === mutant.lineNumber && statement.end.column < mutant.columnNumber) ||
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
}