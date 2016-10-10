'use strict';

import * as _ from 'lodash';
import { normalize } from './utils/fileUtils';
import MutatorOrchestrator from './MutatorOrchestrator';
import Mutant from './Mutant';
import { Config, ConfigWriterFactory } from 'stryker-api/config';
import { StrykerOptions, InputFile } from 'stryker-api/core';
import { Reporter, MutantResult } from 'stryker-api/report';
import { TestSelector } from 'stryker-api/test_selector';
import TestRunnerOrchestrator from './TestRunnerOrchestrator';
import ReporterOrchestrator from './ReporterOrchestrator';
import './jasmine_test_selector/JasmineTestSelector';
import { RunResult, TestResult } from 'stryker-api/test_runner';
import TestSelectorOrchestrator from './TestSelectorOrchestrator';
import MutantRunResultMatcher from './MutantRunResultMatcher';
import InputFileResolver from './InputFileResolver';
import ConfigReader from './ConfigReader';
import PluginLoader from './PluginLoader';
import { freezeRecursively, isPromise } from './utils/objectUtils';
import StrykerTempFolder from './utils/StrykerTempFolder';
import * as log4js from 'log4js';

const log = log4js.getLogger('Stryker');

export default class Stryker {

  config: Config;
  private reporter: Reporter;
  private testSelector: TestSelector;

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
    this.reporter = new ReporterOrchestrator(this.config).createBroadcastReporter();
    this.testSelector = new TestSelectorOrchestrator(this.config).determineTestSelector();
  }

  /**
   * Runs mutation testing. This may take a while.
   * @function
   */
  runMutationTest(): Promise<MutantResult[]> {
    return new InputFileResolver(this.config.mutate, this.config.files).resolve()
      .then((inputFiles) => this.initialTestRun(inputFiles))
      .then(({runResults, inputFiles, testRunnerOrchestrator}) =>
        this.generateAndRunMutations(inputFiles, runResults, testRunnerOrchestrator))
      .then(mutantResults => this.wrapUpReporter()
        .then(StrykerTempFolder.clean)
        .then(() => mutantResults));
  }

  private filterOutUnsuccesfulResults(runResults: RunResult[]) {
    return runResults.filter((runResult: RunResult) => !(!runResult.failed && runResult.result === TestResult.Complete));
  }

  private loadPlugins() {
    if (this.config.plugins) {
      new PluginLoader(this.config.plugins).load();
    }
  }

  private initialTestRun(inputFiles: InputFile[]) {
    let testRunnerOrchestrator = new TestRunnerOrchestrator(this.config, inputFiles, this.testSelector, this.reporter);
    return testRunnerOrchestrator.initialRun()
      .then(runResults => {
        let unsuccessfulTests = this.filterOutUnsuccesfulResults(runResults);
        if (unsuccessfulTests.length) {
          this.logFailedTests(unsuccessfulTests);
          throw new Error('There were failed tests in the initial test run');
        } else {
          this.logInitialTestRunSucceeded(runResults);
          return { runResults, inputFiles, testRunnerOrchestrator };
        }
      });
  }

  private generateAndRunMutations(inputFiles: InputFile[], initialRunResults: RunResult[], testRunnerOrchestrator: TestRunnerOrchestrator): Promise<MutantResult[]> {
    let mutants = this.generateMutants(inputFiles, initialRunResults);
    if (mutants.length) {
      return testRunnerOrchestrator.runMutations(mutants);
    } else {
      log.info('It\'s a mutant-free world, nothing to test.');
      return Promise.resolve([]);
    }
  }

  private generateMutants(inputFiles: InputFile[], runResults: RunResult[]) {
    let mutatorOrchestrator = new MutatorOrchestrator(this.reporter);
    let mutants = mutatorOrchestrator.generateMutants(inputFiles
      .filter(inputFile => inputFile.mutated)
      .map(file => file.path));
    log.info(`${mutants.length} Mutant(s) generated`);
    let mutantRunResultMatcher = new MutantRunResultMatcher(mutants, runResults);
    mutantRunResultMatcher.matchWithMutants();
    return mutants;
  }

  private wrapUpReporter(): Promise<void> {
    let maybePromise = this.reporter.wrapUp();
    if (isPromise(maybePromise)) {
      return maybePromise;
    } else {
      return Promise.resolve<void>();
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
