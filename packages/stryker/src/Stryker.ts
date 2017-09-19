import { Config, ConfigEditorFactory } from 'stryker-api/config';
import { StrykerOptions, File } from 'stryker-api/core';
import { MutantResult } from 'stryker-api/report';
import { TestFramework } from 'stryker-api/test_framework';
import ReporterOrchestrator from './ReporterOrchestrator';
import { RunResult } from 'stryker-api/test_runner';
import TestFrameworkOrchestrator from './TestFrameworkOrchestrator';
import MutantTestMatcher from './MutantTestMatcher';
import InputFileResolver from './InputFileResolver';
import ConfigReader from './ConfigReader';
import PluginLoader from './PluginLoader';
import ScoreResultCalculator from './ScoreResultCalculator';
import ConfigValidator from './ConfigValidator';
import CoverageInstrumenter from './coverage/CoverageInstrumenter';
import { freezeRecursively, isPromise } from './utils/objectUtils';
import { TempFolder } from './utils/TempFolder';
import * as log4js from 'log4js';
import Timer from './utils/Timer';
import StrictReporter from './reporters/StrictReporter';
import MutatorFacade from './MutatorFacade';
import InitialTestExecutor from './process/InitialTestExecutor';
import MutationTestExecutor from './process/MutationTestExecutor';
const log = log4js.getLogger('Stryker');

export default class Stryker {

  config: Config;
  private timer = new Timer();
  private reporter: StrictReporter;
  private testFramework: TestFramework | null;
  private coverageInstrumenter: CoverageInstrumenter;

  /**
   * The Stryker mutation tester.
   * @constructor
   * @param {Object} [options] - Optional options.
   */
  constructor(options: StrykerOptions) {
    let configReader = new ConfigReader(options);
    this.config = configReader.readConfig();
    this.setGlobalLogLevel(); // logLevel could be changed
    this.loadPlugins();
    this.applyConfigEditors();
    this.setGlobalLogLevel(); // logLevel could be changed
    this.freezeConfig();
    this.reporter = new ReporterOrchestrator(this.config).createBroadcastReporter();
    this.testFramework = new TestFrameworkOrchestrator(this.config).determineTestFramework();
    this.coverageInstrumenter = new CoverageInstrumenter(this.config.coverageAnalysis, this.testFramework);
    new ConfigValidator(this.config, this.testFramework).validate();
  }

  async runMutationTest(): Promise<MutantResult[]> {
    this.timer.reset();
    const inputFiles = await new InputFileResolver(this.config.mutate, this.config.files, this.reporter).resolve();
    TempFolder.instance().initialize();    
    const initialTestRunProcess = this.createInitialTestRunner(inputFiles);
    const { runResult, transpiledFiles } = await initialTestRunProcess.run();
    const testableMutants = await this.mutate(inputFiles, runResult);
    if (runResult.tests.length && testableMutants.length) {
      const mutationTestExecutor = this.createMutationTester(inputFiles, transpiledFiles);
      const mutantResults = await mutationTestExecutor.run(testableMutants);
      this.reportScore(mutantResults);
      await this.wrapUpReporter();
      await TempFolder.instance().clean();
      await this.logDone();
      return mutantResults;
    } else {
      return Promise.resolve([]);
    }
  }

  private mutate(inputFiles: File[], runResult: RunResult) {
    const mutator = new MutatorFacade(this.config);
    const mutants = mutator.mutate(inputFiles);
    if (mutants.length) {
      log.info(`${mutants.length} Mutant(s) generated`);
    } else {
      log.info('It\'s a mutant-free world, nothing to test.');
    }
    const mutantRunResultMatcher = new MutantTestMatcher(mutants, inputFiles, runResult, this.coverageInstrumenter.retrieveStatementMapsPerFile(), this.config, this.reporter);
    return mutantRunResultMatcher.matchWithMutants();
  }

  private loadPlugins() {
    if (this.config.plugins) {
      new PluginLoader(this.config.plugins).load();
    }
  }

  private wrapUpReporter(): Promise<void> {
    let maybePromise = this.reporter.wrapUp();
    if (isPromise(maybePromise)) {
      return maybePromise;
    } else {
      return Promise.resolve();
    }
  }

  private applyConfigEditors() {
    ConfigEditorFactory.instance().knownNames().forEach(configEditorName => {
      ConfigEditorFactory.instance().create(configEditorName, undefined).edit(this.config);
    });
  }

  private freezeConfig() {
    freezeRecursively(this.config);
    if (log.isDebugEnabled()) {
      log.debug(`Using config: ${JSON.stringify(this.config)}`);
    }
  }

  private logDone() {
    log.info('Done in %s.', this.timer.humanReadableElapsed());
  }

  private setGlobalLogLevel() {
    log4js.setGlobalLogLevel(this.config.logLevel);
  }

  private createMutationTester(inputFiles: File[], transpiledFiles: File[]) {
    return new MutationTestExecutor(this.config, inputFiles, transpiledFiles, this.testFramework, this.reporter);
  }

  private createInitialTestRunner(inputFiles: File[]) {
    return new InitialTestExecutor(this.config, inputFiles, this.coverageInstrumenter, this.testFramework, this.timer);
  }

  private reportScore(mutantResults: MutantResult[]) {
    const score = ScoreResultCalculator.calculate(mutantResults);
    this.reporter.onScoreCalculated(score);
    ScoreResultCalculator.determineExitCode(score, this.config.thresholds);
  }
}