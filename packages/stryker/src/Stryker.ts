import { getLogger } from 'stryker-api/logging';
import { Config } from 'stryker-api/config';
import { StrykerOptions, MutatorDescriptor } from 'stryker-api/core';
import { MutantResult } from 'stryker-api/report';
import { Mutant } from 'stryker-api/mutant';
import MutantTestMatcher from './MutantTestMatcher';
import InputFileResolver from './input/InputFileResolver';
import ConfigReader from './config/ConfigReader';
import ScoreResultCalculator from './ScoreResultCalculator';
import ConfigValidator from './config/ConfigValidator';
import { freezeRecursively, isPromise } from './utils/objectUtils';
import { TempFolder } from './utils/TempFolder';
import Timer from './utils/Timer';
import MutatorFacade from './MutatorFacade';
import InitialTestExecutor, { InitialTestRunResult } from './process/InitialTestExecutor';
import MutationTestExecutor from './process/MutationTestExecutor';
import InputFileCollection from './input/InputFileCollection';
import LogConfigurator from './logging/LogConfigurator';
import BroadcastReporter from './reporters/BroadcastReporter';
import { coreTokens, CoreContext } from './di';
import { Injector } from 'typed-inject';
import { ConfigEditorApplier } from './config/ConfigEditorApplier';
import { TranspilerFacade } from './transpiler/TranspilerFacade';
import { createCoreInjector } from './di';
import { commonTokens, PluginKind } from 'stryker-api/plugin';
import { PluginCreator } from './di/PluginCreator';

export default class Stryker {

  public config: Config;
  private readonly timer = new Timer();
  private readonly reporter: BroadcastReporter;
  private readonly log = getLogger(Stryker.name);
  private readonly injector: Injector<CoreContext>;

  /**
   * The Stryker mutation tester.
   * @constructor
   * @param {Object} [options] - Optional options.
   */
  constructor(options: Partial<StrykerOptions>) {
    LogConfigurator.configureMainProcess(options.logLevel, options.fileLogLevel, options.allowConsoleColors);
    const configReader = new ConfigReader(options);
    this.config = configReader.readConfig();
    // Log level may have changed
    LogConfigurator.configureMainProcess(this.config.logLevel, this.config.fileLogLevel, this.config.allowConsoleColors); // logLevel could be changed
    this.addDefaultPlugins();
    // Log level may have changed
    LogConfigurator.configureMainProcess(this.config.logLevel, this.config.fileLogLevel, this.config.allowConsoleColors); // logLevel could be changed
    this.injector = createCoreInjector(this.config);
    this.injector.injectClass(ConfigEditorApplier).edit(this.config);
    this.injector.injectClass(ConfigValidator).validate();
    this.freezeConfig();
  }

  public async runMutationTest(): Promise<MutantResult[]> {
    const loggingContext = await LogConfigurator.configureLoggingServer(this.config.logLevel, this.config.fileLogLevel, this.config.allowConsoleColors);
    this.timer.reset();
    const inputFiles = await new InputFileResolver(this.config.mutate, this.config.files, this.reporter).resolve();
    if (inputFiles.files.length) {
      TempFolder.instance().initialize();
      const initialTestRunProcess = this.injector
        .provideValue(coreTokens.inputFiles, inputFiles)
        .provideValue(coreTokens.timer, this.timer)
        .provideValue(coreTokens.loggingContext, loggingContext)
        .provideValue(commonTokens.produceSourceMaps, this.config.coverageAnalysis !== 'off')
        .provideFactory(coreTokens.pluginCreatorTranspiler, PluginCreator.createFactory(PluginKind.Transpiler))
        .provideClass(coreTokens.transpiler, TranspilerFacade)
        .injectClass(InitialTestExecutor);
      const initialTestRunResult = await initialTestRunProcess.run();
      const testableMutants = await this.mutate(inputFiles, initialTestRunResult);
      if (initialTestRunResult.runResult.tests.length && testableMutants.length) {
        const mutationTestExecutor = new MutationTestExecutor(
          this.config,
          inputFiles.files,
          this.injector.resolve(coreTokens.testFramework),
          this.injector.resolve(coreTokens.reporter),
          initialTestRunResult.overheadTimeMS,
          loggingContext);
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
  public addDefaultPlugins(): void {
    this.config.plugins.push(
      require.resolve('./reporters')
    );
  }
  private wrapUpReporter(): Promise<void> {
    const maybePromise = this.reporter.wrapUp();
    if (isPromise(maybePromise)) {
      return maybePromise;
    } else {
      return Promise.resolve();
    }
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
