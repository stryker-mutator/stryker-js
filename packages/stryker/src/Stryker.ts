import { getLogger } from 'stryker-api/logging';
import { Config } from 'stryker-api/config';
import { StrykerOptions } from 'stryker-api/core';
import { MutantResult } from 'stryker-api/report';
import { MutantTestMatcher } from './mutants/MutantTestMatcher';
import InputFileResolver from './input/InputFileResolver';
import ScoreResultCalculator from './ScoreResultCalculator';
import { isPromise } from './utils/objectUtils';
import { TempFolder } from './utils/TempFolder';
import { MutatorFacade } from './mutants/MutatorFacade';
import InitialTestExecutor from './process/InitialTestExecutor';
import { MutationTestExecutor } from './process/MutationTestExecutor';
import LogConfigurator from './logging/LogConfigurator';
import { Injector } from 'typed-inject';
import { TranspilerFacade } from './transpiler/TranspilerFacade';
import { coreTokens, MainContext, PluginCreator, buildMainInjector } from './di';
import { commonTokens, PluginKind } from 'stryker-api/plugin';
import MutantTranspiler from './transpiler/MutantTranspiler';
import { SandboxPool } from './SandboxPool';

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
      const inputFileInjector = this.injector
        .provideValue(coreTokens.loggingContext, loggingContext)
        .provideValue(coreTokens.inputFiles, inputFiles);
      const initialTestRunProcess = inputFileInjector
        .provideValue(commonTokens.produceSourceMaps, this.config.coverageAnalysis !== 'off')
        .provideFactory(coreTokens.pluginCreatorTranspiler, PluginCreator.createFactory(PluginKind.Transpiler))
        .provideClass(coreTokens.transpiler, TranspilerFacade)
        .injectClass(InitialTestExecutor);
      const initialRunResult = await initialTestRunProcess.run();
      const mutator = inputFileInjector.injectClass(MutatorFacade);
      const mutationTestProcessInjector = inputFileInjector
        .provideValue(coreTokens.initialRunResult, initialRunResult)
        .provideClass(coreTokens.mutantTranspiler, MutantTranspiler)
        .provideClass(coreTokens.sandboxPool, SandboxPool);
      const testableMutants = await mutationTestProcessInjector
        .injectClass(MutantTestMatcher)
        .matchWithMutants(mutator.mutate(inputFiles.filesToMutate));
      if (initialRunResult.runResult.tests.length && testableMutants.length) {
        const mutationTestExecutor = mutationTestProcessInjector.injectClass(MutationTestExecutor);
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

  // private mutate(input: InputFileCollection, initialTestRunResult: InitialTestRunResult): TestableMutant[] {
  //   const mutator = this.injector.injectClass(MutatorFacade);
  //   const mutants = mutator.mutate(input.filesToMutate);
  //   const mutantRunResultMatcher = new MutantTestMatcher(
  //     mutants,
  //     input.filesToMutate,
  //     initialTestRunResult.runResult,
  //     initialTestRunResult.sourceMapper,
  //     initialTestRunResult.coverageMaps,
  //     this.config,
  //     this.reporter);
  //   return mutantRunResultMatcher.matchWithMutants();
  // }

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
