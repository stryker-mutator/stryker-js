'use strict';

import * as _ from 'lodash';
import { normalize } from './utils/fileUtils';
import MutatorOrchestrator from './MutatorOrchestrator';
import Mutant from './Mutant';
import { Config, ConfigWriterFactory } from 'stryker-api/config';
import { StrykerOptions, InputFile } from 'stryker-api/core';
import { Reporter, MutantResult } from 'stryker-api/report';
import { TestFramework } from 'stryker-api/test_framework';
import SandboxCoordinator from './SandboxCoordinator';
import ReporterOrchestrator from './ReporterOrchestrator';
import './jasmine_test_framework/JasmineTestFramework';
import { RunResult, TestResult, RunState, TestState } from 'stryker-api/test_runner';
import TestFrameworkOrchestrator from './TestFrameworkOrchestrator';
import MutantTestMatcher from './MutantTestMatcher';
import InputFileResolver from './InputFileResolver';
import ConfigReader from './ConfigReader';
import PluginLoader from './PluginLoader';
import { freezeRecursively, isPromise } from './utils/objectUtils';
import StrykerTempFolder from './utils/StrykerTempFolder';
import * as log4js from 'log4js';

const log = log4js.getLogger('Stryker');

const humanReadableTestState = (testState: TestState) => {
  switch (testState) {
    case TestState.Success:
      return 'SUCCESS';
    case TestState.Failed:
      return 'FAILED';
    case TestState.Skipped:
      return 'SKIPPED';
  }
};

export default class Stryker {

  config: Config;
  private reporter: Reporter;
  private testFramework: TestFramework;

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
    this.testFramework = new TestFrameworkOrchestrator(this.config).determineTestFramework();
  }

  /**
   * Runs mutation testing. This may take a while.
   * @function
   */
  runMutationTest(): Promise<MutantResult[]> {
    return new InputFileResolver(this.config.mutate, this.config.files).resolve()
      .then((inputFiles) => this.initialTestRun(inputFiles))
      .then(({runResult, inputFiles, sandboxCoordinator}) =>
        this.generateAndRunMutations(inputFiles, runResult, sandboxCoordinator))
      .then(mutantResults => this.wrapUpReporter()
        .then(StrykerTempFolder.clean)
        .then(() => mutantResults));
  }

  private filterOutFailedTests(runResult: RunResult) {
    return runResult.tests.filter(testResult => testResult.state === TestState.Failed);
  }

  private loadPlugins() {
    if (this.config.plugins) {
      new PluginLoader(this.config.plugins).load();
    }
  }

  private initialTestRun(inputFiles: InputFile[]) {
    let sandboxCoordinator = new SandboxCoordinator(this.config, inputFiles, this.testFramework, this.reporter);
    return sandboxCoordinator.initialRun()
      .then(runResult => {
        switch (runResult.state) {
          case RunState.Complete:
            let failedTests = this.filterOutFailedTests(runResult);
            if (failedTests.length) {
              this.logFailedTestsInInitialRun(failedTests);
              throw new Error('There were failed tests in the initial test run:');
            } else {
              this.logInitialTestRunSucceeded(runResult.tests);
              return { runResult, inputFiles, sandboxCoordinator };
            }
          case RunState.Error:
            this.logErrorredInitialRun(runResult);
            break;
          case RunState.Timeout:
            this.logTimeoutInitialRun(runResult);
            break;
        }
      });
  }

  private generateAndRunMutations(inputFiles: InputFile[], initialRunResult: RunResult, sandboxCoordinator: SandboxCoordinator): Promise<MutantResult[]> {
    let mutants = this.generateMutants(inputFiles, initialRunResult);
    if (mutants.length) {
      return sandboxCoordinator.runMutants(mutants);
    } else {
      log.info('It\'s a mutant-free world, nothing to test.');
      return Promise.resolve([]);
    }
  }

  private generateMutants(inputFiles: InputFile[], runResult: RunResult) {
    let mutatorOrchestrator = new MutatorOrchestrator(this.reporter);
    let mutants = mutatorOrchestrator.generateMutants(inputFiles
      .filter(inputFile => inputFile.mutated)
      .map(file => file.path));
    log.info(`${mutants.length} Mutant(s) generated`);
    let mutantRunResultMatcher = new MutantTestMatcher(mutants, runResult);
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

  private logInitialTestRunSucceeded(tests: TestResult[]) {
    log.info('Initial test run succeeded. Ran %s tests.', tests.length);
  }

  private setGlobalLogLevel() {
    log4js.setGlobalLogLevel(this.config.logLevel);
  }

  private logFailedTestsInInitialRun(failedTests: TestResult[]): void {
    let message = 'One or more tests failed in the initial test run:';
    failedTests.forEach(test => {
      message += `\n\t${test.name}`;
      if (test.errorMessages && test.errorMessages.length) {
        message += `\n\t${test.errorMessages.join('\n\t')}`;
      }
    });
    log.error(message);
  }
  private logErrorredInitialRun(runResult: RunResult) {
    let message = 'One or more tests errored in the initial test run:';
    if (runResult.errorMessages && runResult.errorMessages.length) {
      runResult.errorMessages.forEach(error => message += `\n\t${error}`);
    }
    log.error(message);
  }

  private logTimeoutInitialRun(runResult: RunResult) {
    let message = 'Initial run timed out! Ran following tests before timeout:';
    runResult.tests.forEach(test => `\n\t${test.name} ${humanReadableTestState(test.state)}`);
    log.error(message);
  }
}
