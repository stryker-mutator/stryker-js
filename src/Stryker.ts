'use strict';

import * as _ from 'lodash';
var program = require('commander');
import FileUtils, {glob} from './utils/FileUtils';
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
  constructor(private mutateFiles: string[], private allFiles: string[], options?: StrykerOptions) {
    this.fileUtils.normalize(mutateFiles);
    this.fileUtils.normalize(allFiles);

    options = options || {};
    options.testFramework = 'jasmine';
    options.testRunner = 'karma';
    options.port = 1234;
    this.testRunnerOrchestrator = new TestRunnerOrchestrator(options, mutateFiles, allFiles);

    var reporterFactory = new ReporterFactory();
    this.reporter = reporterFactory.getReporter('console');
  }

  /**
   * Runs mutation testing. This may take a while.
   * @function
   */
  runMutationTest(): Promise<void> {
    return new Promise<void>(resolve => {
      console.log('INFO: Running initial test run');
      this.testRunnerOrchestrator.recordCoverage().then((runResults) => {
        let unsuccessfulTests = runResults.filter((runResult: RunResult) => {
          return !(runResult.failed === 0 && runResult.result === TestResult.Complete);
        });
        if (unsuccessfulTests.length === 0) {
          console.log('INFO: Initial test run succeeded');

          let mutator = new Mutator();
          let mutants = mutator.mutate(this.mutateFiles);
          console.log('INFO: ' + mutants.length + ' Mutants generated');

          let mutantRunResultMatcher = new MutantRunResultMatcher(mutants, runResults);
          mutantRunResultMatcher.matchWithMutants();

          this.testRunnerOrchestrator.runMutations(mutants, this.reporter).then(() => {
            this.reporter.allMutantsTested(mutants);
            console.log('Done!');
            resolve();
          });
        } else {
          this.logFailedTests(unsuccessfulTests);
        }
      });
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
    unsuccessfulTests.forEach(runResult => {
      runResult.specNames.forEach(specName => {
        if (specNames.indexOf(specName) < 0) {
          specNames.push(specName);
        }
      });
    });

    console.log('ERROR: One or more tests failed in the inial test run:');
    specNames.forEach(filename => {
      console.log('\t', filename);
    });
    if (specNames.length > 0) {
      console.log('ERROR: One or more tests failed in the inial test run:');
      specNames.forEach(filename => {
        console.log('\t', filename);
      });
    }
  }
}

function reportEmptyGlobbingExpression(expression: string) {
  console.log(`WARNING: Globbing expression ${expression} did not result in any files.`)
}

function resolveFileGlobes(sourceExpressions: string[], resultFiles: string[]): Promise<void[]> {
  return Promise.all(sourceExpressions.map((mutateFileExpression: string) => glob(mutateFileExpression).then(files => {
    if (files.length === 0) {
      reportEmptyGlobbingExpression(mutateFileExpression);
    }
    files.forEach(f => resultFiles.push(f));
  })));
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
    let mutateFiles: string[] = [];
    let allFiles: string[] = [];

    Promise.all([resolveFileGlobes(program.mutate, mutateFiles), resolveFileGlobes(program.files, allFiles)])
      .then(() => {
        
        var stryker = new Stryker(mutateFiles, allFiles);
        stryker.runMutationTest();
      }, error => {
        console.log('ERROR: ', error);
      });

  }
})();
