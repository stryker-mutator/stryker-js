'use strict';

import * as _ from 'lodash';
var program = require('commander');
import {normalize} from './utils/FileUtils';
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
import InputFileResolver from './InputFileResolver';

export default class Stryker {

  reporter: BaseReporter;
  options: StrykerOptions;

  /**
   * The Stryker mutation tester.
   * @constructor
   * @param {String[]} mutateFilePatterns - A comma seperated list of globbing expression used for selecting the files that should be mutated
   * @param {String[]} allFilePatterns - A comma seperated list of globbing expression used for selecting all files needed to run the tests. These include library files, test files and files to mutate, but should NOT include test framework files (for example jasmine)
   * @param {Object} [options] - Optional options.
   */
  constructor(private mutateFilePatterns: string[], private allFilePatterns: string[], options?: StrykerOptions) {

    this.options = options || {};
    this.options.testFramework = 'jasmine';
    this.options.testRunner = 'karma';
    this.options.port = 1234;

    var reporterFactory = new ReporterFactory();
    this.reporter = reporterFactory.getReporter('console');
  }

  /**
   * Runs mutation testing. This may take a while.
   * @function
   */
  runMutationTest(): Promise<void> {

    return new Promise<void>(resolve => {

      new InputFileResolver(this.mutateFilePatterns, this.allFilePatterns)
        .resolve().then(inputFiles => {
          let testRunnerOrchestrator = new TestRunnerOrchestrator(this.options, inputFiles)

          testRunnerOrchestrator.recordCoverage().then((runResults) => {
            let unsuccessfulTests = runResults.filter((runResult: RunResult) => {
              return !(runResult.failed === 0 && runResult.result === TestResult.Complete);
            });
            if (unsuccessfulTests.length === 0) {
              console.log(`INFO: Initial test run succeeded. Ran ${runResults.length} tests.`);

              let mutator = new Mutator();
              let mutants = mutator.mutate(inputFiles
                .filter(inputFile => inputFile.shouldMutate)
                .map(file => file.path));
              console.log('INFO: ' + mutants.length + ' Mutants generated');

              let mutantRunResultMatcher = new MutantRunResultMatcher(mutants, runResults);
              mutantRunResultMatcher.matchWithMutants();

              testRunnerOrchestrator.runMutations(mutants, this.reporter).then(() => {
                this.reporter.allMutantsTested(mutants);
                console.log('Done!');
              });
            } else {
              this.logFailedTests(unsuccessfulTests);
            }
            resolve();
          });
        }, (errors: string[]) => {
          errors.forEach(error => console.log(`ERROR: ${error}`));
          resolve();
        });


      console.log('INFO: Running initial test run');

    });
  }



  /**
   * Looks through a list of RunResults to see if all tests have passed.
   * @function
   * @param {RunResult[]} runResults - The list of RunResults.
   * @returns {Boolean} True if all tests passed.
   */
  private logFailedTests(unsuccessfulTests: RunResult[]): void {
    let failedSpecNames =
      _.uniq(
        _.flatten(unsuccessfulTests
          .filter(runResult => runResult.result === TestResult.Complete)
          .map(runResult => runResult.specNames)
        ))
        .sort();
    if (failedSpecNames.length > 0) {
      console.log('ERROR: One or more tests failed in the inial test run:');
      failedSpecNames.forEach(filename => console.log('\t', filename));
    }

    let errors =
      _.flatten(unsuccessfulTests
        .filter(runResult => runResult.result === TestResult.Error)
        .map(runResult => runResult.errorMessages))
        .sort();

    if (errors.length > 0) {
      console.log('ERROR: One or more tests errored in the initial test run:')
      errors.forEach(error => console.log('\t', error));
    }
  }
}

(function run() {
  function list(val: string) {
    return val.split(',');
  }
  //TODO: Implement the new Stryker options
  program
    .usage('-f <files> -m <filesToMutate> [other options]')
    .description('Starts the stryker mutation testing process. Required arguments are --mutate and --files. You can use globbing expressions to target multiple files. See https://github.com/isaacs/node-glob#glob-primer for more information about the globbing syntax.')
    .option('-m, --mutate <filesToMutate>', `A comma seperated list of globbing expression used for selecting the files that should be mutated.
                              Example: src/**/*.js,a.js`, list)
    .option('-f, --files <allFiles>', `A comma seperated list of globbing expression used for selecting all files needed to run the tests. These include library files, test files and files to mutate, but should NOT include test framework files (for example jasmine).
                              Example: node_modules/a-lib/**/*.js,src/**/*.js,a.js,test/**/*.js`, list)
    .parse(process.argv);

  if (program.mutate && program.files) {
    new Stryker(program.mutate, program.files).runMutationTest();
  }
})();
