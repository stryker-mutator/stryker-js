import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { TestRunner, DryRunOptions, MutantRunOptions, DryRunResult, MutantRunResult, toMutantRunResult } from '@stryker-mutator/api/test-runner';

import { StrykerKarmaSetup } from '../src-generated/karma-runner-options';

import { karma } from './karma-wrapper';
import strykerKarmaConf from './starters/stryker-karma.conf';
import { ProjectStarter } from './starters/project-starter';
import { StrykerReporter } from './karma-plugins/stryker-reporter';
import { KarmaRunnerOptionsWithStrykerOptions } from './karma-runner-options-with-stryker-options';
import { TestHooksMiddleware } from './karma-plugins/test-hooks-middleware';

export class KarmaTestRunner implements TestRunner {
  private readonly starter: ProjectStarter;
  private exitPromise: Promise<number> | undefined;

  public static inject = tokens(commonTokens.logger, commonTokens.getLogger, commonTokens.options);
  constructor(private readonly log: Logger, getLogger: LoggerFactoryMethod, options: StrykerOptions) {
    const setup = this.loadSetup(options);
    this.starter = new ProjectStarter(getLogger, setup);
    this.setGlobals(setup, getLogger);
  }

  public async init(): Promise<void> {
    this.exitPromise = this.starter.start();
    await StrykerReporter.instance.whenBrowsersReady();
  }

  public dryRun(options: DryRunOptions): Promise<DryRunResult> {
    TestHooksMiddleware.instance.configureCoverageAnalysis(options.coverageAnalysis);
    return this.run();
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    TestHooksMiddleware.instance.configureActiveMutant(options);
    const dryRunResult = await this.run();
    return toMutantRunResult(dryRunResult);
  }

  private async run(): Promise<DryRunResult> {
    this.runServer();
    const runResult = await StrykerReporter.instance.whenRunCompletes();
    return runResult;
  }

  public async dispose(): Promise<void> {
    if (StrykerReporter.instance.karmaServer) {
      await StrykerReporter.instance.karmaServer.stop();
      await this.exitPromise;
    }
    StrykerReporter.instance.karmaServer = undefined;
    StrykerReporter.instance.karmaConfig = undefined;
  }

  private loadSetup(options: StrykerOptions): StrykerKarmaSetup {
    const defaultKarmaConfig: StrykerKarmaSetup = {
      projectType: 'custom',
    };
    return Object.assign(defaultKarmaConfig, (options as KarmaRunnerOptionsWithStrykerOptions).karma);
  }

  private setGlobals(setup: StrykerKarmaSetup, getLogger: LoggerFactoryMethod) {
    strykerKarmaConf.setGlobals({
      getLogger,
      karmaConfig: setup.config,
      karmaConfigFile: setup.configFile,
    });
  }

  private runServer(): void {
    karma.runner.run(StrykerReporter.instance.karmaConfig, (exitCode) => {
      this.log.debug('karma run done with ', exitCode);
    });
  }
}
