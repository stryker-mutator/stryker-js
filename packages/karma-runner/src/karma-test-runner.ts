import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { TestRunner, DryRunOptions, MutantRunOptions, DryRunResult, MutantRunResult, toMutantRunResult } from '@stryker-mutator/api/test-runner';
import type { Config } from 'karma';

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
  private runConfig!: Config;

  public static inject = tokens(commonTokens.logger, commonTokens.getLogger, commonTokens.options);
  constructor(private readonly log: Logger, getLogger: LoggerFactoryMethod, options: StrykerOptions) {
    const setup = this.loadSetup(options);
    this.starter = new ProjectStarter(getLogger, setup);
    this.setGlobals(setup, getLogger);
  }

  public async init(): Promise<void> {
    const browsersReadyPromise = StrykerReporter.instance.whenBrowsersReady();
    const { exitPromise } = await this.starter.start();
    this.exitPromise = exitPromise;
    const maybeExitCode = await Promise.race([browsersReadyPromise, exitPromise]);
    if (typeof maybeExitCode === 'number') {
      throw new Error(
        `Karma exited prematurely with exit code ${maybeExitCode}. Please run stryker with \`--logLevel trace\` to see the karma logging and figure out what's wrong.`
      );
    } else {
      // Create new run config. Older versions of karma will always parse the config again when you provide it in `karma.runner.run
      // which results in the karma config file being executed again, which has very bad side effects (all files would be loaded twice and such)
      this.runConfig = await karma.config.parseConfig(null, {
        hostname: StrykerReporter.instance.karmaConfig!.hostname,
        port: StrykerReporter.instance.karmaConfig!.port,
        listenAddress: StrykerReporter.instance.karmaConfig!.listenAddress,
      });
    }
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    TestHooksMiddleware.instance.configureCoverageAnalysis(options.coverageAnalysis);
    const res = await this.run();
    return res;
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    TestHooksMiddleware.instance.configureMutantRun(options);
    StrykerReporter.instance.configureHitLimit(options.hitLimit);
    const dryRunResult = await this.run();
    return toMutantRunResult(dryRunResult);
  }

  private run(): Promise<DryRunResult> {
    const runPromise = StrykerReporter.instance.whenRunCompletes();
    this.runServer();
    return runPromise;
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
    karma.runner.run(this.runConfig, (exitCode) => {
      this.log.debug('karma run done with ', exitCode);
    });
  }
}
