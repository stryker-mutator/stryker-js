'use strict';

import * as _ from 'lodash';
var program = require('commander');
import FileUtils from './utils/FileUtils';
import Mutator from './Mutator';
import Mutant from './Mutant';
import ReporterFactory from './ReporterFactory';
import BaseReporter from './reporters/BaseReporter';

import {StrykerOptions} from './api/core';
import TestRunnerOrchestrator from './TestRunnerOrchestrator';
import './jasmine_test_selector/JasmineTestSelector';
import './karma-runner/KarmaTestRunner';
import {RunResult, TestResult} from './api/test_runner';
import MutantRunResultMatcher from './MutantRunResultMatcher';

export default class Stryker {

  fileUtils = new FileUtils();
  reporter: BaseReporter;
  private testRunnerOrchestrator: TestRunnerOrchestrator;

  /**
   * The Stryker mutation tester.
   * @constructor
   * @param {String[]} sourceFiles - The list of source files which should be mutated.
   * @param {String[]} otherFiles - The list of test files.
   * @param {Object} [options] - Optional options.
   */
  constructor(private sourceFiles: string[], private otherFiles: string[], options?: StrykerOptions) {
    this.fileUtils.normalize(sourceFiles);
    this.fileUtils.normalize(otherFiles);
    this.fileUtils.createBaseTempFolder();

    options = options || {};
    options.testFramework = 'jasmine';
    options.testRunner = 'karma';
    options.port = 1234;
    this.testRunnerOrchestrator = new TestRunnerOrchestrator(options, sourceFiles, otherFiles);

    var reporterFactory = new ReporterFactory();
    this.reporter = reporterFactory.getReporter('console');
  }

  /**
   * Runs mutation testing. This may take a while.
   * @function
   */
  runMutationTest(cb: () => void) {
    console.log('INFO: Running initial test run');
    this.testRunnerOrchestrator.recordCoverage().then((runResults) => {
      let unsuccessfulTests = runResults.filter((runResult: RunResult) => runResult.failed > 0 || runResult.result !== TestResult.Complete);
      if (unsuccessfulTests.length === 0) {
        console.log('INFO: Initial test run succeeded');

        let mutator = new Mutator();
        let mutants = mutator.mutate(this.sourceFiles);
        console.log('INFO: ' + mutants.length + ' Mutants generated');

        let mutantRunResultMatcher = new MutantRunResultMatcher(mutants, runResults);
        mutantRunResultMatcher.matchWithMutants();

        this.testRunnerOrchestrator.runMutations(mutants, this.reporter).then(() => {
          this.reporter.allMutantsTested(mutants);
          console.log('Done!');
          cb();
        });
      } else {
        this.logFailedTests(unsuccessfulTests);
      }
    });

  }

  /**
   * Looks through a list of RunResults to see if all tests have passed.
   * @function
   * @param {RunResult[]} runResults - The list of RunResults.
   * @returns {Boolean} True if all tests passed.
   */
  private logFailedTests(unsuccessfulTests: RunResult[]): void {
    let specNames: string[] = [];
    unsuccessfulTests.forEach((runResult, i) => {
      switch (runResult.result) {
        case TestResult.Complete:
          runResult.specNames.forEach(specName => {
            if (specNames.indexOf(specName) < 0) {
              specNames.push(specName);
            }
          });
          break;
        case TestResult.Error:
          console.log(`ERROR: test iteration ${i} resulted in an error`);
          break;
        case TestResult.Timeout:
          console.log(`ERROR: test iteration ${i} resulted in a timeout`);
          break;
      }

      if (runResult.errorMessages) {
        runResult.errorMessages.forEach(error => console.log(`ERROR: ${error}`));
      }
    });
    if (specNames.length > 0) {
      console.log('ERROR: One or more tests failed in the inial test run:');
      specNames.forEach(filename => {
        console.log('\t', filename);
      });
    }
  }
}
(function run() {
  function list(val: string) {
    return val.split(',');
  }
  //TODO: Implement the new Stryker options
  program
    .usage('-s <items> -t <items> [other options]')
    .option('-s, --src <items>', 'A list of source files. Example: a.js,b.js', list)
    .option('-o, --other-files <items>', 'A list of other files, such as test files or library files. Example: a.js,b.js', list)
    .parse(process.argv);

  if (program.src && program.otherFiles) {
    var stryker = new Stryker(program.src, program.otherFiles);
    stryker.runMutationTest(function() { });
  }
})();
