import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, PluginKind } from '@stryker-mutator/api/plugin';
import { MutantResult } from '@stryker-mutator/api/report';
import { Injector } from 'typed-inject';
import { HttpClient } from 'typed-rest-client/HttpClient';

import { buildMainInjector, coreTokens, MainContext, PluginCreator } from './di';
import InputFileCollection from './input/InputFileCollection';
import InputFileResolver from './input/InputFileResolver';
import LogConfigurator from './logging/LogConfigurator';
import { MutantTestMatcher } from './mutants/MutantTestMatcher';
import { MutatorFacade } from './mutants/MutatorFacade';
import InitialTestExecutor from './process/InitialTestExecutor';
import { MutationTestExecutor } from './process/MutationTestExecutor';
import { MutationTestReportCalculator } from './reporters/MutationTestReportCalculator';
import { SandboxPool } from './SandboxPool';
import ScoreResultCalculator from './ScoreResultCalculator';
import { transpilerFactory } from './transpiler';
import { MutantTranspileScheduler } from './transpiler/MutantTranspileScheduler';
import { TranspilerFacade } from './transpiler/TranspilerFacade';
import { Statistics } from './statistics/Statistics';

export default class Stryker {
  private readonly log: Logger;
  private readonly injector: Injector<MainContext>;

  private get reporter() {
    return this.injector.resolve(coreTokens.reporter);
  }

  private get options(): Readonly<StrykerOptions> {
    return this.injector.resolve(commonTokens.options);
  }

  private get timer() {
    return this.injector.resolve(coreTokens.timer);
  }

  private get temporaryDirectory() {
    return this.injector.resolve(coreTokens.temporaryDirectory);
  }

  /**
   * The Stryker mutation tester.
   * @constructor
   * @param {Object} [cliOptions] - Optional options.
   */
  constructor(cliOptions: Partial<StrykerOptions>) {
    LogConfigurator.configureMainProcess(cliOptions.logLevel, cliOptions.fileLogLevel, cliOptions.allowConsoleColors);
    this.injector = buildMainInjector(cliOptions);
    this.log = this.injector.resolve(commonTokens.getLogger)(Stryker.name);
    // Log level may have changed
    LogConfigurator.configureMainProcess(this.options.logLevel, this.options.fileLogLevel, this.options.allowConsoleColors);
  }

  public async runMutationTest(): Promise<MutantResult[]> {
    const loggingContext = await LogConfigurator.configureLoggingServer(
      this.options.logLevel,
      this.options.fileLogLevel,
      this.options.allowConsoleColors
    );
    this.timer.reset();
    const inputFiles = await this.injector.injectClass(InputFileResolver).resolve();
    if (inputFiles.files.length) {
      this.temporaryDirectory.initialize();
      const inputFileInjector = this.injector.provideValue(coreTokens.loggingContext, loggingContext).provideValue(coreTokens.inputFiles, inputFiles);
      const initialTestRunProcess = inputFileInjector
        .provideValue(commonTokens.produceSourceMaps, this.options.coverageAnalysis !== 'off')
        .provideFactory(coreTokens.pluginCreatorTranspiler, PluginCreator.createFactory(PluginKind.Transpiler))
        .provideClass(coreTokens.transpiler, TranspilerFacade)
        .injectClass(InitialTestExecutor);
      const initialRunResult = await initialTestRunProcess.run();
      const mutator = inputFileInjector.injectClass(MutatorFacade);
      const transpilerProvider = inputFileInjector
        .provideValue(coreTokens.initialRunResult, initialRunResult)
        .provideValue(commonTokens.produceSourceMaps, false)
        .provideFactory(coreTokens.transpiler, transpilerFactory);
      const transpiler = transpilerProvider.resolve(coreTokens.transpiler);
      const transpiledFiles = await transpiler.transpile(inputFiles.files);
      const mutationTestProcessInjector = transpilerProvider
        .provideValue(coreTokens.transpiledFiles, transpiledFiles)
        .provideClass(coreTokens.mutantTranspileScheduler, MutantTranspileScheduler)
        .provideClass(coreTokens.sandboxPool, SandboxPool);
      const testableMutants = await mutationTestProcessInjector
        .injectClass(MutantTestMatcher)
        .matchWithMutants(mutator.mutate(inputFiles.filesToMutate));
      // IF OPT-IN
      const statisticsProcess = inputFileInjector.provideValue('httpClient', new HttpClient('httpClient')).injectClass(Statistics);
      try {
        if (initialRunResult.runResult.tests.length && testableMutants.length) {
          const mutationTestExecutor = mutationTestProcessInjector.injectClass(MutationTestExecutor);
          const mutantResults = await mutationTestExecutor.run(testableMutants);
          await this.reportScore(mutantResults, inputFileInjector, statisticsProcess);
          if (statisticsProcess) statisticsProcess.addStatistic('duration', this.timer.elapsedSeconds());
          await this.logDone();
          return mutantResults;
        } else {
          this.logTraceLogLevelHint();
        }
      } catch (e) {
        if (statisticsProcess) statisticsProcess.addStatistic('error', String(e));
      } finally {
        // `injector.dispose` calls `dispose` on all created instances
        // Namely the `SandboxPool`, `MutantTranspileScheduler` and `ChildProcessProxy` instances
        await statisticsProcess.sendStatistics();
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

  private async reportScore(
    mutantResults: MutantResult[],
    inputFileInjector: Injector<MainContext & { inputFiles: InputFileCollection }>,
    statistics?: Statistics
  ) {
    inputFileInjector.injectClass(MutationTestReportCalculator).report(mutantResults);
    const calculator = this.injector.injectClass(ScoreResultCalculator);
    const score = calculator.calculate(mutantResults);
    this.reporter.onScoreCalculated(score);
    calculator.determineExitCode(score, this.options.thresholds);
    if (statistics) statistics.addStatistic('score', score.mutationScore);
    await this.reporter.wrapUp();
  }
}
