'use strict';

import * as _ from 'lodash';
import {normalize} from './utils/fileUtils';
import MutatorOrchestrator from './MutatorOrchestrator';
import Mutant from './Mutant';
import {Config, ConfigWriterFactory} from 'stryker-api/config';
import {StrykerOptions} from 'stryker-api/core';
import {Reporter, MutantResult} from 'stryker-api/report';
import TestRunnerOrchestrator from './TestRunnerOrchestrator';
import ReporterOrchestrator from './ReporterOrchestrator';
import './jasmine_test_selector/JasmineTestSelector';
import {RunResult, TestResult} from 'stryker-api/test_runner';
import TestSelectorOrchestrator from './TestSelectorOrchestrator';
import MutantRunResultMatcher from './MutantRunResultMatcher';
import InputFileResolver from './InputFileResolver';
import ConfigReader from './ConfigReader';
import PluginLoader from './PluginLoader';
import {freezeRecursively, isPromise} from './utils/objectUtils';
import StrykerTempFolder from './utils/StrykerTempFolder';
import * as log4js from 'log4js';

const log = log4js.getLogger('Stryker');

export default class Stryker {

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
    this.freezeConfig();
  }

  /**
   * Runs mutation testing. This may take a while.
   * @function
   */
  runMutationTest(): Promise<MutantResult[]> {
    let reporter = new ReporterOrchestrator(this.config).createBroadcastReporter();
    let testSelector = new TestSelectorOrchestrator(this.config).determineTestSelector();

    return new InputFileResolver(this.config.mutate, this.config.files).resolve()
      .then(inputFiles => {
        let testRunnerOrchestrator = new TestRunnerOrchestrator(this.config, inputFiles, testSelector, reporter);
        return testRunnerOrchestrator.initialRun().then(runResults => ({ runResults, inputFiles, testRunnerOrchestrator }));
      })
      .then(tuple => {
        let runResults = tuple.runResults;
        let inputFiles = tuple.inputFiles;
        let testRunnerOrchestrator = tuple.testRunnerOrchestrator;
        let unsuccessfulTests = this.filterOutUnsuccesfulResults(runResults);
        if (unsuccessfulTests.length === 0) {
          this.logInitialTestRunSucceeded(runResults);
          let mutatorOrchestrator = new MutatorOrchestrator(reporter);
          let mutants = mutatorOrchestrator.generateMutants(inputFiles
            .filter(inputFile => inputFile.mutated)
            .map(file => file.path));
          log.info(`${mutants.length} Mutant(s) generated`);

          let mutantRunResultMatcher = new MutantRunResultMatcher(mutants, runResults);
          mutantRunResultMatcher.matchWithMutants();

          return testRunnerOrchestrator.runMutations(mutants);
        } else {
          this.logFailedTests(unsuccessfulTests);
          throw new Error('There were failed tests in the initial test run');
        }
      }).then(mutantResults => {
        let maybePromise = reporter.wrapUp();
        if (isPromise(maybePromise)) {
          return maybePromise.then(() => mutantResults);
        } else {
          return mutantResults;
        }
      }).then(mutantResults => StrykerTempFolder.clean().then(() => mutantResults));
  }

  filterOutUnsuccesfulResults(runResults: RunResult[]) {
    return runResults.filter((runResult: RunResult) => !(!runResult.failed && runResult.result === TestResult.Complete));
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

  private freezeConfig() {
    freezeRecursively(this.config);
    if (log.isDebugEnabled()) {
      log.debug(`Using config: ${JSON.stringify(this.config)}`);
    }
  }

  private logInitialTestRunSucceeded(runResults: RunResult[]) {
    let totalAmountOfTests = 0;
    runResults.forEach(result => {
      if (result.succeeded) {
        totalAmountOfTests += result.succeeded;
      }
    });
    log.info('Initial test run succeeded. Ran %s tests.', totalAmountOfTests);
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
          .map(runResult => runResult.testNames)
        ))
        .sort();
    if (failedSpecNames.length > 0) {
      let message = 'One or more tests failed in the inial test run:';
      failedSpecNames.forEach(filename => message += `\n\t${filename}`);
      log.error(message);
    }

    let errors =
      _.flatten(unsuccessfulTests
        .filter(runResult => runResult.result === TestResult.Error)
        .map(runResult => runResult.errorMessages))
        .sort();

    if (errors.length > 0) {
      let message = 'One or more tests errored in the initial test run:';
      errors.forEach(error => message += `\n\t${error}`);
      log.error(message);
    }
  }
}
