import { getLogger } from 'stryker-api/logging';
import { Config } from 'stryker-api/config';
import { StrykerOptions, MutatorDescriptor } from 'stryker-api/core';
import { MutantResult } from 'stryker-api/report';
import { Mutant } from 'stryker-api/mutant';
import MutantTestMatcher from './MutantTestMatcher';
import InputFileResolver from './input/InputFileResolver';
import ScoreResultCalculator from './ScoreResultCalculator';
import { isPromise } from './utils/objectUtils';
import { TempFolder } from './utils/TempFolder';
import MutatorFacade from './MutatorFacade';
import InitialTestExecutor, { InitialTestRunResult } from './process/InitialTestExecutor';
import MutationTestExecutor from './process/MutationTestExecutor';
import InputFileCollection from './input/InputFileCollection';
import LogConfigurator from './logging/LogConfigurator';
import { Injector } from 'typed-inject';
import { TranspilerFacade } from './transpiler/TranspilerFacade';
import { coreTokens, MainContext, PluginCreator, buildMainInjector } from './di';
import { commonTokens, PluginKind } from 'stryker-api/plugin';

export default class Stryker {

  private readonly log = getLogger(Stryker.name);
  private readonly injector: Injector<MainContext>;

  private get reporter() {
    return this.injector.resolve(coreTokens.reporter);
  }

  private get config(): Readonly<Config> {
    return this.injector.resolve(commonTokens.config);
  }

  private get timer() {
    return this.injector.resolve(coreTokens.timer);
  }

  /**
   * The Stryker mutation tester.
   * @constructor
   * @param {Object} [cliOptions] - Optional options.
   */
  constructor(cliOptions: Partial<StrykerOptions>) {
    LogConfigurator.configureMainProcess(cliOptions.logLevel, cliOptions.fileLogLevel, cliOptions.allowConsoleColors);
    this.injector = buildMainInjector(cliOptions);
    // Log level may have changed
    const options = this.config;
    LogConfigurator.configureMainProcess(options.logLevel, options.fileLogLevel, options.allowConsoleColors);
  }

  public async runMutationTest(): Promise<MutantResult[]> {
    const loggingContext = await LogConfigurator.configureLoggingServer(this.config.logLevel, this.config.fileLogLevel, this.config.allowConsoleColors);
    this.timer.reset();
    const inputFiles = await this.injector.injectClass(InputFileResolver).resolve();
    if (inputFiles.files.length) {
      TempFolder.instance().initialize();
      const initialTestRunProcess = this.injector
        .provideValue(coreTokens.inputFiles, inputFiles)
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
          this.reporter,
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
  private wrapUpReporter(): Promise<void> {
    const maybePromise = this.reporter.wrapUp();
    if (isPromise(maybePromise)) {
      return maybePromise;
    } else {
      return Promise.resolve();
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
