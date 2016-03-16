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
//import StrykerOptions from './StrykerOptions';

import StrykerOptions from './api/core/StrykerOptions';
import TestRunnerOrchestrator from './TestRunnerOrchestrator';
import './jasmine_test_selector/JasmineTestSelector';
import './karma-runner/KarmaTestRunner'; 

export default class Stryker {

  fileUtils = new FileUtils();
  reporter: BaseReporter;
  testRunner: BaseTestRunner;
  private testRunnerOrchestrator: TestRunnerOrchestrator;

  /**
   * The Stryker mutation tester.
   * @constructor
   * @param {String[]} sourceFiles - The list of source files which should be mutated.
   * @param {String[]} testFiles - The list of test files.
   * @param {Object} [options] - Optional options.
   * @param {Number} [options].[timeoutMs] - Amount of additional time, in milliseconds, the mutation test is allowed to run.
   * @param {Number} [options].[timeoutFactor] - A factor which is applied to the timeout.
   * @param {Boolean} [options].[individualTests] - Indicates whether the tests in test files should be split up, possibly resulting in faster mutation testing.
   */
  constructor(private sourceFiles: string[], private testFiles: string[], options?: StrykerOptions) {
    this.fileUtils.normalize(sourceFiles);
    this.fileUtils.normalize(testFiles);
    this.fileUtils.createBaseTempFolder();

    if (options) {
      options = {
        //libs: options.libs || [],
        timeoutMs: options.timeoutMs || 3000,
        timeoutFactor: options.timeoutFactor || 1.25,
        //individualTests: options.individualTests || false
      };
    } else {
      options = {
        libs: [],
        timeoutMs: 3000,
        timeoutFactor: 1.25,
        individualTests: false
      };
    }
    //this.fileUtils.normalize(options.libs);
    
    options.testFramework = 'jasmine';
    options.testRunner = 'karma';
    options.port = 1234;
    this.testRunnerOrchestrator = new TestRunnerOrchestrator(options, sourceFiles, testFiles);
  }

  /**
   * Runs mutation testing. This may take a while.
   * @function
   */
    runMutationTest(cb: () => void) {
      console.log('INFO: Running initial test run');
      this.testRunnerOrchestrator.recordCoverage().then((runResults) => {
          console.log('INFO: Initial test run succeeded');
          console.log(runResults);
          runResults.forEach(runResult => {
            // console.log(runResult.specNames);
          });
          cb();
      });
    
    // this.testRunner.testAndCollectCoverage(this.sourceFiles, this.testFiles, (testResults: TestResult[]) => {
    //   if (this.allTestsSuccessful(testResults)) {
    //     console.log('INFO: Initial test run succeeded');
    //     var mutator = new Mutator();
    //     var mutants = mutator.mutate(this.sourceFiles);
    //     console.log('INFO: ' + mutants.length + ' Mutants generated');

    //     var testFilesToRemove: TestFile[] = [];
    //     _.forEach(testResults, (testResult: TestResult) => {
    //       testFilesToRemove = testFilesToRemove.concat(testResult.testFiles);
    //     });

    //     this.testRunner.testMutants(mutants, this.sourceFiles, testResults,
    //       (mutant: Mutant) => {
    //         // Call the reporter like this instead of passing the function directly to ensure that `this` in the reporter is still the reporter.
    //         this.reporter.mutantTested(mutant);
    //       },
    //       (mutants: Mutant[]) => {
    //         this.reporter.allMutantsTested(mutants);

    //         _.forEach(testFilesToRemove, (testFile: TestFile) => {
    //           testFile.remove();
    //         });
    //         this.fileUtils.removeBaseTempFolder();

    //         if (cb) {
    //           cb();
    //         }
    //       });
    //   } else {
    //     console.log('ERROR: One or more tests failed in the inial test run!');
    //   }
    //});
  }

  /**
   * Looks through a list of TestResults to see if all tests have passed.
   * @function
   * @param {TestResult[]} testResults - The list of TestResults.
   * @returns {Boolean} True if all tests passed.
   */
  private allTestsSuccessful(testResults: TestResult[]): boolean {
    var unsuccessfulTest = _.find(testResults, (result: TestResult) => {
      return !result.allTestsSuccessful;
    });
    return _.isUndefined(unsuccessfulTest);
  };
}
(function run() {
  function list(val: string) {
    return val.split(',');
  }
  //TODO: Implement the new Stryker options
  program
    .usage('-s <items> -t <items> [other options]')
    .option('-s, --src <items>', 'A list of source files. Example: a.js,b.js', list)
    .option('-t, --tests <items>', 'A list of test files. Example: a.js,b.js', list)
    .option('-l, --libs [<items>]', 'A list of library files. Example: a.js,b.js', list)
    .option('-m, --timeout-ms [amount]', 'Amount of additional time, in milliseconds, the mutation test is allowed to run')
    .option('-f, --timeout-factor [amount]', 'The factor is applied on top of the other timeouts when during mutation testing')
    .option('-i, --individual-tests', 'Runs each test separately instead of entire test files')
    .parse(process.argv);

  if (program.src && program.tests) {
    var options: StrykerOptions = {
      libs: program.libs,
      timeoutMs: Number(program.timeoutMs),
      timeoutFactor: Number(program.timeoutFactor),
      individualTests: program.individualTests
    };

    var stryker = new Stryker(program.src, program.tests, options);
    stryker.runMutationTest(function() { });
  }
})();
