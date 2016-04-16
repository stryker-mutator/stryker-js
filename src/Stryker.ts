'use strict';

import * as _ from 'lodash';
var program = require('commander');
import {normalize} from './utils/fileUtils';
import Mutator from './Mutator';
import Mutant from './Mutant';
import ReporterFactory from './ReporterFactory';
import BaseReporter from './reporters/BaseReporter';
import {Config, ConfigWriterFactory} from './api/config';
import {StrykerOptions} from './api/core';
import TestRunnerOrchestrator from './TestRunnerOrchestrator';
import './jasmine_test_selector/JasmineTestSelector';
import './karma-runner/KarmaTestRunner';
import {RunResult, TestResult} from './api/test_runner';
import MutantRunResultMatcher from './MutantRunResultMatcher';
import InputFileResolver from './InputFileResolver';
import ConfigReader, {CONFIG_SYNTAX_HELP} from './ConfigReader';
import PluginLoader from './PluginLoader';
import {freezeRecursively} from './utils/objectUtils';
import * as log4js from 'log4js';

export default class Stryker {

  reporter: BaseReporter;
  config: Config;

  /**
   * The Stryker mutation tester.
   * @constructor
   * @param {String[]} mutateFilePatterns - A comma seperated list of globbing expression used for selecting the files that should be mutated
   * @param {String[]} allFilePatterns - A comma seperated list of globbing expression used for selecting all files needed to run the tests. These include library files, test files and files to mutate, but should NOT include test framework files (for example jasmine)
   * @param {Object} [options] - Optional options.
   */
  constructor(options: StrykerOptions) {
    let configReader = new ConfigReader(options);
    this.config = configReader.readConfig();
    this.setGlobalLogLevel(); // loglevel could be changed
    this.loadPlugins();
    this.applyConfigWriters();
    this.setGlobalLogLevel(); // loglevel could be changed
    freezeRecursively(this.config);
    var reporterFactory = new ReporterFactory();
    this.reporter = reporterFactory.getReporter('console');
  }

  /**
   * Runs mutation testing. This may take a while.
   * @function
   */
  runMutationTest(): Promise<void> {

    return new Promise<void>((strykerResolve, strykerReject) => {

      new InputFileResolver(this.config.mutate, this.config.files)
        .resolve().then(inputFiles => {
          console.log('INFO: Running initial test run');
          let testRunnerOrchestrator = new TestRunnerOrchestrator(this.config, inputFiles)
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
                strykerResolve();
              });
            } else {
              this.logFailedTests(unsuccessfulTests);
              strykerReject();
            }
          }, (errors) => {
            strykerReject(errors);
          });
        }, (errors: string[]) => {
          errors.forEach(error => console.log(`ERROR: ${error}`));
          strykerReject();
        });
    });
  }

  private loadPlugins() {
    if (this.config.plugins) {
      new PluginLoader(this.config.plugins).load();
    }
  }

  private applyConfigWriters() {
    ConfigWriterFactory.instance().knownNames().forEach(configWriterName => {
      ConfigWriterFactory.instance().create(configWriterName, undefined).write(this.config);
    });
  }

  private setGlobalLogLevel() {
    log4js.setGlobalLogLevel(this.config.logLevel);
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
  program
    .usage('-f <files> -m <filesToMutate> -c <configFileLocation> [other options]')
    .description('Starts the stryker mutation testing process. Required arguments are --mutate and --files. You can use globbing expressions to target multiple files. See https://github.com/isaacs/node-glob#glob-primer for more information about the globbing syntax.')
    .option('-m, --mutate <filesToMutate>', `A comma seperated list of globbing expression used for selecting the files that should be mutated.
                              Example: src/**/*.js,a.js`, list)
    .option('-f, --files <allFiles>', `A comma seperated list of globbing expression used for selecting all files needed to run the tests. These include library files, test files and files to mutate, but should NOT include test framework files (for example jasmine).
                              Example: node_modules/a-lib/**/*.js,src/**/*.js,a.js,test/**/*.js`, list)
    .option('-c, --configFile <configFileLocation>', 'A location to a config file. That file should export a function which accepts a "config" object\n' +
    CONFIG_SYNTAX_HELP)
    .option('--logLevel <level>', 'Set the log4js loglevel. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "info"')
    .parse(process.argv);

  log4js.setGlobalLogLevel(program['logLevel'] || 'info')

  new Stryker(program).runMutationTest();
})();
