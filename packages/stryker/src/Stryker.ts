import { Config, ConfigEditorFactory } from 'stryker-api/config';
import { StrykerOptions, MutatorDescriptor, File } from 'stryker-api/core';
import { MutantResult } from 'stryker-api/report';
import { TestFramework } from 'stryker-api/test_framework';
import { Mutant } from 'stryker-api/mutant';
import ReporterOrchestrator from './ReporterOrchestrator';
import TestFrameworkOrchestrator from './TestFrameworkOrchestrator';
import MutantTestMatcher from './MutantTestMatcher';
import InputFileResolver from './InputFileResolver';
import ConfigReader from './ConfigReader';
import PluginLoader from './PluginLoader';
import ScoreResultCalculator from './ScoreResultCalculator';
import ConfigValidator from './ConfigValidator';
import { freezeRecursively, isPromise } from './utils/objectUtils';
import { TempFolder } from './utils/TempFolder';
import * as log4js from 'log4js';
import Timer from './utils/Timer';
import StrictReporter from './reporters/StrictReporter';
import MutatorFacade from './MutatorFacade';
import InitialTestExecutor, { InitialTestRunResult } from './process/InitialTestExecutor';
import MutationTestExecutor from './process/MutationTestExecutor';
import SourceMapper from './transpiler/SourceMapper';

export default class Stryker {

  config: Config;
  private timer = new Timer();
  private reporter: StrictReporter;
  private testFramework: TestFramework | null;
  private readonly log = log4js.getLogger(Stryker.name);

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
    new ConfigValidator(this.config, this.testFramework).validate();
  }

  async runMutationTest(): Promise<MutantResult[]> {
    this.timer.reset();
    const inputFiles = await new InputFileResolver(this.config.mutate, this.config.files, this.reporter).resolve();
    TempFolder.instance().initialize();
    const initialTestRunProcess = this.createInitialTestRunProcess(inputFiles);
    const initialTestRunResult = await initialTestRunProcess.run();
    const testableMutants = await this.mutate(inputFiles, initialTestRunResult);
    if (initialTestRunResult.runResult.tests.length && testableMutants.length) {
      const mutationTestExecutor = this.createMutationTester(inputFiles);
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

  private mutate(inputFiles: File[], initialTestRunResult: InitialTestRunResult) {
    const mutator = new MutatorFacade(this.config);
    const allMutants = mutator.mutate(inputFiles);
    const includedMutants = this.removeExcludedMutants(allMutants);
    this.logMutantCount(includedMutants.length, allMutants.length);
    const mutantRunResultMatcher = new MutantTestMatcher(
      includedMutants,
      inputFiles,
      initialTestRunResult.runResult,
      SourceMapper.create(initialTestRunResult.transpiledFiles, this.config),
      initialTestRunResult.coverageMaps,
      this.config,
      this.reporter);
    return mutantRunResultMatcher.matchWithMutants();
  }

  private logMutantCount(includedMutantCount: number, totalMutantCount: number) {
    let mutantCountMessage;
    if (includedMutantCount) {
      mutantCountMessage = `${includedMutantCount} Mutant(s) generated`;
    } else {
      mutantCountMessage = `It\'s a mutant-free world, nothing to test.`;
    }
    const numberExcluded = totalMutantCount - includedMutantCount;
    if (numberExcluded) {
      mutantCountMessage += ` (${numberExcluded} Mutant(s) excluded)`;
    }
    this.log.info(mutantCountMessage);
  }

  private removeExcludedMutants(mutants: Mutant[]): Mutant[] {
    if (typeof this.config.mutator === 'string') {
      return mutants;
    }
    const mutatorDescriptor = this.config.mutator as MutatorDescriptor;
    return mutants.filter(mutant => mutatorDescriptor.excludedMutations.indexOf(mutant.mutatorName) === -1);
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
    if (this.log.isDebugEnabled()) {
      this.log.debug(`Using config: ${JSON.stringify(this.config)}`);
    }
  }

  private logDone() {
    this.log.info('Done in %s.', this.timer.humanReadableElapsed());
  }

  private setGlobalLogLevel() {
    log4js.setGlobalLogLevel(this.config.logLevel);
  }

  private createMutationTester(inputFiles: File[]) {
    return new MutationTestExecutor(this.config, inputFiles, this.testFramework, this.reporter);
  }

  private createInitialTestRunProcess(inputFiles: File[]) {
    return new InitialTestExecutor(this.config, inputFiles, this.testFramework, this.timer);
  }

  private reportScore(mutantResults: MutantResult[]) {
    const calculator = new ScoreResultCalculator();
    const score = calculator.calculate(mutantResults);
    this.reporter.onScoreCalculated(score);
    calculator.determineExitCode(score, this.config.thresholds);
  }
}