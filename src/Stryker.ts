'use strict';

import * as _ from 'lodash';
var program = require('commander');
import FileUtils from './utils/FileUtils';
import Mutator from './Mutator';
import Mutant from './Mutant';
import ReporterFactory from './ReporterFactory';
import TestRunnerFactory from './TestRunnerFactory';
import BaseReporter from './reporters/BaseReporter';
import BaseTestRunner from './testrunners/BaseTestRunner';
import TestFile from './TestFile';
import TestResult from './TestResult';
import StrykerOptions from './StrykerOptions';

export default class Stryker {

  fileUtils = new FileUtils();
  reporter: BaseReporter;
  testRunner: BaseTestRunner;

  /**
   * The Stryker mutation tester.
   * @constructor
   * @param {String[]} sourceFiles - The list of source files which should be mutated.
   * @param {String[]} testFiles - The list of test files.
   * @param {Object} [options] - Optional options.
   */
  constructor(private sourceFiles: string[], private otherFiles: string[], options?: StrykerOptions) {
    this.fileUtils.normalize(sourceFiles);
    this.fileUtils.normalize(otherFiles);
    this.fileUtils.createBaseTempFolder();

    var reporterFactory = new ReporterFactory();
    var testRunnerFactory = new TestRunnerFactory();

    this.reporter = reporterFactory.getReporter('console');
    this.testRunner = testRunnerFactory.getTestRunner('jasmine', options);
  }

  /**
   * Runs mutation testing. This may take a while.
   * @function
   */
  runMutationTest(cb: () => void) {
    console.log('INFO: Running initial test run');
    this.testRunner.testAndCollectCoverage(this.sourceFiles, this.otherFiles, (testResults: TestResult[]) => {
      let unsuccessfulTests = testResults.filter((result: TestResult) => {
        return !result.allTestsSuccessful;
      });
      if (unsuccessfulTests.length === 0) {
        console.log('INFO: Initial test run succeeded');
        var mutator = new Mutator();
        var mutants = mutator.mutate(this.sourceFiles);
        console.log('INFO: ' + mutants.length + ' Mutants generated');

        var testFilesToRemove: TestFile[] = [];
        _.forEach(testResults, (testResult: TestResult) => {
          testFilesToRemove = testFilesToRemove.concat(testResult.testFiles);
        });

        this.testRunner.testMutants(mutants, this.sourceFiles, testResults,
          (mutant: Mutant) => {
            // Call the reporter like this instead of passing the function directly to ensure that `this` in the reporter is still the reporter.
            this.reporter.mutantTested(mutant);
          },
          (mutants: Mutant[]) => {
            this.reporter.allMutantsTested(mutants);

            _.forEach(testFilesToRemove, (testFile: TestFile) => {
              testFile.remove();
            });
            this.fileUtils.removeBaseTempFolder();

            if (cb) {
              cb();
            }
          });
      } else {
        this.logFailedTests(unsuccessfulTests);
      }
    });
  }

  /**
   * Logs all (unique) tests in the array of TestResults with the message that they have failed.
   * @param unsuccessfulTests - The TestResults which contain tests which have failed.
   * @function
   */
  private logFailedTests(unsuccessfulTests: TestResult[]): void {
    let testFilenames: string[] = [];
    unsuccessfulTests.forEach(testResult => {
      testResult.testFiles.forEach(testFile => {
        if (testFilenames.indexOf(testFile.name) < 0) {
          testFilenames.push(testFile.name);
        }
      });
    });
    
    console.log('ERROR: One or more tests failed in the inial test run:');
    testFilenames.forEach(filename => {
      console.log('\t', filename);
    });
  }
}
(function run() {
  function list(val: string) {
    return val.split(',');
  }
  program
    .usage('-s <items> -t <items> [other options]')
    .option('-s, --src <items>', 'A list of source files. Example: a.js,b.js', list)
    .option('-o, --other-files <items>', 'A list of other files, such as test files or library files. Example: a.js,b.js', list)
    .parse(process.argv);

  if (program.src && program.tests) {
    var stryker = new Stryker(program.src, program.tests);
    stryker.runMutationTest(function() { });
  }
})();
