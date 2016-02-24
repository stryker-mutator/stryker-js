'use strict';

import * as _ from 'lodash';
import TestRunnerConfig from './TestRunnerConfig';
import TestFile from '../TestFile';
import TypeUtils from '../utils/TypeUtils';
import * as karma from 'karma';
import Mutant, {MutantTestedCallback, MutantsTestedCallback} from '../Mutant';

import TestResult from '../TestResult';

export interface  TestsCompletedCallback{
  (testResults: TestResult[]) : void;
}
export interface  TestCompletedCallback{
  (testResults: TestResult) : void;
}

export interface TestRunMetadata {
  config: TestRunnerConfig;
  src: string[];
  tests: TestFile[];
  completedCb: TestCompletedCallback;
}

abstract class BaseTestRunner {

  protected _typeUtils = new TypeUtils();
  protected _baseTimeout = 0;
  protected _timeoutMs = 0;
  protected _timeoutFactor = 1.0;
  protected _testQueue: TestRunMetadata[] = [];
  protected _queuedTestsRunning = 0;
  protected _maxQueuedTests = 5;
  
  
  /**
   * Represents the base test runner as a blueprint for all test runners.
   * @param {Object} config - The configuration for the test runner.
   * @constructor
   */
  constructor(protected _config: TestRunnerConfig) {
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
  test(config: TestRunnerConfig, sourceFiles: string[], testFiles: TestFile[], testCompletedCallback: TestCompletedCallback) {
    this._typeUtils.expectParameterObject(config, 'BaseTestRunner', 'config');
    this._typeUtils.expectParameterArray(sourceFiles, 'BaseTestRunner', 'sourceFiles');
    this._typeUtils.expectParameterArray(testFiles, 'BaseTestRunner', 'testFiles');
    this._typeUtils.expectParameterFunction(testCompletedCallback, 'BaseTestRunner', 'testCompletedCallback');
  }

  /**
   * Queues a test for execution on the provided source files.
   * @function
   * @param config - The configuration for the test run.
   * @param  sourceFiles - The names of the files which should be tested.
   * @param {TestFile[]} testFiles - The tests which should be executed.
   * @param {BaseTestRunner~testCompletedCallback} testCompletedCallback - The callback which is called when the test has been completed.
   */
  queueTest(config: TestRunnerConfig, sourceFiles: string[], testFiles: TestFile[], testCompletedCallback: TestCompletedCallback) {
    this._typeUtils.expectParameterObject(config, 'BaseTestRunner', 'config');
    this._typeUtils.expectParameterArray(sourceFiles, 'BaseTestRunner', 'sourceFiles');
    this._typeUtils.expectParameterArray(testFiles, 'BaseTestRunner', 'testFiles');
    this._typeUtils.expectParameterFunction(testCompletedCallback, 'BaseTestRunner', 'testCompletedCallback');

    var queuedTest: TestRunMetadata = {
      config: config,
      src: sourceFiles,
      tests: testFiles,
      completedCb: testCompletedCallback
    };
    this._testQueue.push(queuedTest);
    this.tryRunningNextQueuedTest();
  }

  /**
   * Attempts to run the next queued test, if the limit of the number of queued tests is not already reached.
   * @function
   */
  tryRunningNextQueuedTest() {

    if (this._queuedTestsRunning < this._maxQueuedTests && this._testQueue.length > 0) {
      this._queuedTestsRunning++;
      var queuedTest = _.pullAt(this._testQueue, 0)[0];
      this.test(queuedTest.config, queuedTest.src, queuedTest.tests, (testResult: TestResult) => {
        queuedTest.completedCb(testResult);
        this._queuedTestsRunning--;
        this.tryRunningNextQueuedTest();
      });
    }
  }

  /**
   * Generates TestFile instances based on a list of paths to test files.
   * @function
   * @param testFiles - The list of test files which have to be turned into TestFile instances.
   * @returns The generated TestFiles.
   */
  _generateTestFiles(testFiles: string[]): TestFile[] {
    this._typeUtils.expectParameterArray(testFiles, 'BaseTestRunner', 'testFiles');

    var testsToRun: TestFile[] = [];

    if (this._config.individualTests) {
      testsToRun = this._splitTests(testFiles);
    } else {
      testsToRun = _.map(testFiles, function(testFile) {
        return new TestFile(testFile);
      });
    }

    return testsToRun;
  }



  /**
   * Splits a test file into a set of TestFiles which each contain only one test.
   * @function
   * @param  testFile - The name of the test file which has to be split.
   * @returns The tests in which the testFile was split.
   */
  _splitTest(testFile: string) : TestFile[]{
    this._typeUtils.expectParameterString(testFile, 'BaseTestRunner', 'testFile');
    return null;
  }

  /**
   * Splits an array of test files into a set of TestFiles which each contain only one test.
   * @function
   * @param testFiles - The list of test files which have to be split.
   * @returns The tests in which the testFile was split.
   */
  _splitTests(testFiles: string[]): TestFile[] {
    this._typeUtils.expectParameterArray(testFiles, 'BaseTestRunner', 'testFiles');
    var individualTests: TestFile[] = [];

    _.forEach(testFiles, testFile => {
      individualTests = individualTests.concat(this._splitTest(testFile));
    });

    return individualTests;
  }

  /**
   * Executes tests on the provided source files and collects the code coverage.
   * @function
   * @param sourceFiles - The names of the files which should be tested.
   * @param testFiles - The names of the tests which should be executed.
   * @param testCompletedCallback - The callback which is called when the test has been completed.
   */
  testAndCollectCoverage(sourceFiles: string[], testFiles: string[], testCompletedCallback: TestsCompletedCallback) {
    this._typeUtils.expectParameterArray(sourceFiles, 'BaseTestRunner', 'sourceFiles');
    this._typeUtils.expectParameterArray(testFiles, 'BaseTestRunner', 'testFiles');
    this._typeUtils.expectParameterFunction(testCompletedCallback, 'BaseTestRunner', 'testCompletedCallback');
  }

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
   * @param mutants - The array with Mutant objects which have to be tested.
   * @param sourceFiles - The list of source files without mutations.
   * @param testResults - The list of test results from the original test run.
   * @param singleMutantTestedCallback - The callback which is called when one Mutant have been tested.
   * @param allMutantsTestedCallback - The callback which is called when all Mutants have been tested.
   */
  testMutants(mutants: Mutant[], sourceFiles: string[], testResults: TestResult[], singleMutantTestedCallback: MutantTestedCallback, allMutantsTestedCallback: MutantsTestedCallback) {
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
      var testFiles: TestFile[] = [];
      _.forEach(testResultsWithCoverage, function(testResult) {
        if (testResult.coversMutant(mutant)) {
          testFiles = testFiles.concat(testResult.getTestFiles());
          baseTimeout += testResult.getTimeSpent();
        }
      });
      testFiles = _.uniq(testFiles);
      that.setBaseTimeout(baseTimeout);

      var config: TestRunnerConfig = _.cloneDeep(that._config);
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
  }

  _waitForCodeCoverage(testResults: TestResult[]) {
    this._typeUtils.expectParameterArray(testResults, 'BaseTestRunner', 'testResults');
    var testResultsWithCoverage: TestResult[] = [];
    var checkIfCoverageExists = (testResult: TestResult, index: number) => {
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
  }

  /**
   * Sets the base timeout in milliseconds.
   * @function
   * @param {Number} timeout - The new base timeout in milliseconds.
   */
  setBaseTimeout(baseTimeout: number) {
    this._typeUtils.expectParameterNumber(baseTimeout, 'BaseTestRunner', 'baseTimeout');
    this._baseTimeout = Number(baseTimeout);
  }

  /**
   * Gets the base timeout in milliseconds.
   * @function
   * @returns {Number} The base timeout in milliseconds.
   */
  getBaseTimeout() {
    return this._baseTimeout;
  }

  /**
   * Sets the timeout in milliseconds which should be applied on top of the base timeout.
   * @function
   * @param {Number} timeoutMs - The new timeout in milliseconds.
   */
  setTimeoutMs(timeoutMs: number) {
    this._typeUtils.expectParameterNumber(timeoutMs, 'BaseTestRunner', 'timeoutMs');
    this._timeoutMs = Number(timeoutMs);
  }

  /**
   * Gets the timeout in milliseconds which is applied on top of the base timeout.
   * @function
   * @returns {Number} The timeout in milliseconds.
   */
  getTimeoutMs(): number {
    return this._timeoutMs;
  }

  /**
   * Sets the factor which should be applied on top of the base timeout and timeout in milliseconds.
   * @function
   * @param {Number} timeoutFactor - The new timeout factor.
   */
  setTimeoutFactor(timeoutFactor: number) {
    this._typeUtils.expectParameterNumber(timeoutFactor, 'BaseTestRunner', 'timeoutFactor');
    this._timeoutFactor = Number(timeoutFactor);
  }

  /**
   * Gets the timeout factor.
   * @function
   * @returns {Number} The timeout factor.
   */
  getTimeoutFactor(): number {
    return this._timeoutFactor;
  }

  /**
   * Gets the total timeout. Combines all other timeouts.
   * @function
   * @returns {Number} The total timeout in milliseconds.
   */
  getTotalTimeout(): number {
    return (this._baseTimeout + this._timeoutMs) * this._timeoutFactor;
  };
}

export default BaseTestRunner;
