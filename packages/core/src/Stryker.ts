import { StrykerOptions } from '@stryker-mutator/api/core';
import { MutantResult } from '@stryker-mutator/api/report';
import { MutantTestMatcher } from './mutants/MutantTestMatcher';
import InputFileResolver from './input/InputFileResolver';
import ScoreResultCalculator from './ScoreResultCalculator';
import { TempFolder } from './utils/TempFolder';
import { MutatorFacade } from './mutants/MutatorFacade';
import InitialTestExecutor from './process/InitialTestExecutor';
import { MutationTestExecutor } from './process/MutationTestExecutor';
import LogConfigurator from './logging/LogConfigurator';
import { Injector } from 'typed-inject';
import { TranspilerFacade } from './transpiler/TranspilerFacade';
import { coreTokens, MainContext, PluginCreator, buildMainInjector } from './di';
import { COMMON_TOKENS, PluginKind } from '@stryker-mutator/api/plugin';
import { MutantTranspileScheduler } from './transpiler/MutantTranspileScheduler';
import { SandboxPool } from './SandboxPool';
import { Logger } from '@stryker-mutator/api/logging';
import { transpilerFactory } from './transpiler';
import { MutationTestReportCalculator } from './reporters/MutationTestReportCalculator';
import InputFileCollection from './input/InputFileCollection';

export default class Stryker {

  private readonly log: Logger;
  private readonly injector: Injector<MainContext>;

  private get reporter() {
    return this.injector.resolve(coreTokens.Reporter);
  }

  private get options(): Readonly<StrykerOptions> {
    return this.injector.resolve(COMMON_TOKENS.options);
  }

  private get timer() {
    return this.injector.resolve(coreTokens.Timer);
  }

  /**
   * The Stryker mutation tester.
   * @constructor
   * @param {Object} [cliOptions] - Optional options.
   */
  constructor(cliOptions: Partial<StrykerOptions>) {
    LogConfigurator.configureMainProcess(cliOptions.logLevel, cliOptions.fileLogLevel, cliOptions.allowConsoleColors);
    this.injector = buildMainInjector(cliOptions);
    this.log = this.injector.resolve(COMMON_TOKENS.getLogger)(Stryker.name);
    // Log level may have changed
    LogConfigurator.configureMainProcess(this.options.logLevel, this.options.fileLogLevel, this.options.allowConsoleColors);
  }

  public async runMutationTest(): Promise<MutantResult[]> {
    const loggingContext = await LogConfigurator.configureLoggingServer(this.options.logLevel, this.options.fileLogLevel, this.options.allowConsoleColors);
    this.timer.reset();
    const inputFiles = await this.injector.injectClass(InputFileResolver).resolve();
    if (inputFiles.files.length) {
      TempFolder.instance().initialize();
      const inputFileInjector = this.injector
        .provideValue(coreTokens.LoggingContext, loggingContext)
        .provideValue(coreTokens.InputFiles, inputFiles);
      const initialTestRunProcess = inputFileInjector
        .provideValue(COMMON_TOKENS.produceSourceMaps, this.options.coverageAnalysis !== 'off')
        .provideFactory(coreTokens.PluginCreatorTranspiler, PluginCreator.createFactory(PluginKind.Transpiler))
        .provideClass(coreTokens.Transpiler, TranspilerFacade)
        .injectClass(InitialTestExecutor);
      const initialRunResult = await initialTestRunProcess.run();
      const mutator = inputFileInjector.injectClass(MutatorFacade);
      const transpilerProvider = inputFileInjector
        .provideValue(coreTokens.InitialRunResult, initialRunResult)
        .provideValue(COMMON_TOKENS.produceSourceMaps, false)
        .provideFactory(coreTokens.Transpiler, transpilerFactory);
      const transpiler = transpilerProvider.resolve(coreTokens.Transpiler);
      const transpiledFiles = await transpiler.transpile(inputFiles.files);
      const mutationTestProcessInjector = transpilerProvider
        .provideValue(coreTokens.TranspiledFiles, transpiledFiles)
        .provideClass(coreTokens.MutantTranspileScheduler, MutantTranspileScheduler)
        .provideClass(coreTokens.SandboxPool, SandboxPool);
      const testableMutants = await mutationTestProcessInjector
        .injectClass(MutantTestMatcher)
        .matchWithMutants(mutator.mutate(inputFiles.filesToMutate));
      try {
        if (initialRunResult.runResult.tests.length && testableMutants.length) {
          const mutationTestExecutor = mutationTestProcessInjector
            .injectClass(MutationTestExecutor);
          const mutantResults = await mutationTestExecutor.run(testableMutants);
          await this.reportScore(mutantResults, inputFileInjector);
          await TempFolder.instance().clean();
          await this.logDone();
          return mutantResults;
        } else {
          this.logTraceLogLevelHint();
        }
      } finally {
        // `injector.dispose` calls `dispose` on all created instances
        // Namely the `SandboxPool`, `MutantTranspileScheduler` and `ChildProcessProxy` instances
        await mutationTestProcessInjector.dispose();
        await LogConfigurator.shutdown();
      }
    }
    return Promise.resolve([]);
  }

  private logDone() {
    this.log.info('Done in %s.', this.timer.humanReadableElapsed());
  }

  private logTraceLogLevelHint() {
    if (!this.log.isTraceEnabled()) {
      this.log.info('Trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.');
    }
  }

  private async reportScore(mutantResults: MutantResult[], inputFileInjector: Injector<MainContext & { inputFiles: InputFileCollection }>) {
    inputFileInjector.injectClass(MutationTestReportCalculator).report(mutantResults);
    const calculator = this.injector.injectClass(ScoreResultCalculator);
    const score = calculator.calculate(mutantResults);
    this.reporter.onScoreCalculated(score);
    calculator.determineExitCode(score, this.options.thresholds);
    await this.reporter.wrapUp();
  }
}
