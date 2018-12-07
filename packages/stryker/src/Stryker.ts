import { getLogger, Logger } from 'stryker-api/logging';
import { Config, ConfigEditorFactory } from 'stryker-api/config';
import { StrykerOptions, MutatorDescriptor } from 'stryker-api/core';
import { MutantResult } from 'stryker-api/report';
import { TestFramework } from 'stryker-api/test_framework';
import { Mutant } from 'stryker-api/mutant';
import ReporterOrchestrator from './ReporterOrchestrator';
import TestFrameworkOrchestrator from './TestFrameworkOrchestrator';
import MutantTestMatcher from './MutantTestMatcher';
import InputFileResolver from './input/InputFileResolver';
import ConfigReader from './config/ConfigReader';
import PluginLoader from './PluginLoader';
import ScoreResultCalculator from './ScoreResultCalculator';
import ConfigValidator from './config/ConfigValidator';
import { freezeRecursively, isPromise } from './utils/objectUtils';
import { TempFolder } from './utils/TempFolder';
import Timer from './utils/Timer';
import StrictReporter from './reporters/StrictReporter';
import MutatorFacade from './MutatorFacade';
import InitialTestExecutor, { InitialTestRunResult } from './process/InitialTestExecutor';
import MutationTestExecutor from './process/MutationTestExecutor';
import InputFileCollection from './input/InputFileCollection';
import LogConfigurator from './logging/LogConfigurator';

export default class Stryker {

  public config: Config;
  private readonly timer = new Timer();
  private readonly reporter: StrictReporter;
  private readonly testFramework: TestFramework | null;
  private readonly log: Logger;

  /**
   * The Stryker mutation tester.
   * @constructor
   * @param {Object} [options] - Optional options.
   */
  constructor(options: StrykerOptions) {
    LogConfigurator.configureMainProcess(options.logLevel, options.fileLogLevel, options.allowConsoleColors);
    this.log = getLogger(Stryker.name);
    const configReader = new ConfigReader(options);
    this.config = configReader.readConfig();
    LogConfigurator.configureMainProcess(this.config.logLevel, this.config.fileLogLevel, this.config.allowConsoleColors); // logLevel could be changed
    this.loadPlugins();
    this.applyConfigEditors();
    LogConfigurator.configureMainProcess(this.config.logLevel, this.config.fileLogLevel, this.config.allowConsoleColors); // logLevel could be changed
    this.freezeConfig();
    this.reporter = new ReporterOrchestrator(this.config).createBroadcastReporter();
    this.testFramework = new TestFrameworkOrchestrator(this.config).determineTestFramework();
    new ConfigValidator(this.config, this.testFramework).validate();
  }

  public async runMutationTest(): Promise<MutantResult[]> {
    const loggingContext = await LogConfigurator.configureLoggingServer(this.config.logLevel, this.config.fileLogLevel, this.config.allowConsoleColors);
    this.timer.reset();
    const inputFiles = await new InputFileResolver(this.config.mutate, this.config.files, this.reporter).resolve();
    if (inputFiles.files.length) {
      TempFolder.instance().initialize();
      const initialTestRunProcess = new InitialTestExecutor(this.config, inputFiles, this.testFramework, this.timer, loggingContext);
      const initialTestRunResult = await initialTestRunProcess.run();
      const testableMutants = await this.mutate(inputFiles, initialTestRunResult);
      if (initialTestRunResult.runResult.tests.length && testableMutants.length) {
        const mutationTestExecutor = new MutationTestExecutor(this.config, inputFiles.files, this.testFramework, this.reporter,
          initialTestRunResult.overheadTimeMS, loggingContext);
        const mutantResults = await mutationTestExecutor.run(testableMutants);
        this.reportScore(mutantResults);
        await this.wrapUpReporter();
        await TempFolder.instance().clean();
        await this.logDone();
        await LogConfigurator.shutdown();
        return mutantResults;
      } else {
        this.logRemark();
      }
    }
    return Promise.resolve([]);
  }

  private mutate(input: InputFileCollection, initialTestRunResult: InitialTestRunResult) {
    const mutator = new MutatorFacade(this.config);
    const allMutants = mutator.mutate(input.filesToMutate);
    const includedMutants = this.removeExcludedMutants(allMutants);
    this.logMutantCount(includedMutants.length, allMutants.length);
    const mutantRunResultMatcher = new MutantTestMatcher(
      includedMutants,
      input.filesToMutate,
      initialTestRunResult.runResult,
      initialTestRunResult.sourceMapper,
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

  private removeExcludedMutants(mutants: ReadonlyArray<Mutant>): ReadonlyArray<Mutant> {
    if (typeof this.config.mutator === 'string') {
      return mutants;
    } else {
      const mutatorDescriptor = this.config.mutator as MutatorDescriptor;
      return mutants.filter(mutant => mutatorDescriptor.excludedMutations.indexOf(mutant.mutatorName) === -1);
    }
  }

  private loadPlugins() {
    if (this.config.plugins) {
      new PluginLoader(this.config.plugins).load();
    }
  }

  private wrapUpReporter(): Promise<void> {
    const maybePromise = this.reporter.wrapUp();
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
    // A config class instance is not serializable using surrial.
    // This is a temporary work around
    // See https://github.com/stryker-mutator/stryker/issues/365
    const config: Config = {} as any;
    for (const prop in this.config) {
      config[prop] = this.config[prop];
    }
    this.config = freezeRecursively(config);
    if (this.log.isDebugEnabled()) {
      this.log.debug(`Using config: ${JSON.stringify(this.config)}`);
    }
  }

  private logDone() {
    this.log.info('Done in %s.', this.timer.humanReadableElapsed());
  }

  private logRemark() {
    if (!this.log.isTraceEnabled()) {
      this.log.info('Trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.');
    }
  }

  private reportScore(mutantResults: MutantResult[]) {
    const calculator = new ScoreResultCalculator();
    const score = calculator.calculate(mutantResults);
    this.reporter.onScoreCalculated(score);
    calculator.determineExitCode(score, this.config.thresholds);
  }
}
