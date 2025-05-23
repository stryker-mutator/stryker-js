import semver from 'semver';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import {
  commonTokens,
  Injector,
  PluginContext,
  tokens,
} from '@stryker-mutator/api/plugin';
import {
  TestRunner,
  DryRunOptions,
  MutantRunOptions,
  DryRunResult,
  MutantRunResult,
  toMutantRunResult,
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';
import type { Config } from 'karma';

import { StrykerKarmaSetup } from '../src-generated/karma-runner-options.js';

import { karma } from './karma-wrapper.js';
import {
  createProjectStarter,
  ProjectStarter,
} from './starters/project-starter.js';
import {
  configureKarma,
  StrykerReporter,
  TestHooksMiddleware,
} from './karma-plugins/index.js';
import { KarmaRunnerOptionsWithStrykerOptions } from './karma-runner-options-with-stryker-options.js';
import { pluginTokens } from './plugin-tokens.js';

createKarmaTestRunner.inject = tokens(commonTokens.injector);
export function createKarmaTestRunner(
  injector: Injector<PluginContext>,
): KarmaTestRunner {
  return injector
    .provideFactory(pluginTokens.projectStarter, createProjectStarter)
    .injectClass(KarmaTestRunner);
}

const MIN_KARMA_VERSION = '6.3.0';

export class KarmaTestRunner implements TestRunner {
  private exitPromise: Promise<number> | undefined;
  private runConfig!: Config;
  private isDisposed = false;

  public static inject = tokens(
    commonTokens.logger,
    commonTokens.getLogger,
    commonTokens.options,
    pluginTokens.projectStarter,
  );
  constructor(
    private readonly log: Logger,
    getLogger: LoggerFactoryMethod,
    options: StrykerOptions,
    private readonly starter: ProjectStarter,
  ) {
    const setup = this.loadSetup(options);
    configureKarma.setGlobals({
      getLogger,
      karmaConfig: setup.config,
      karmaConfigFile: setup.configFile,
      disableBail: options.disableBail,
    });
  }

  public capabilities(): TestRunnerCapabilities {
    return { reloadEnvironment: true };
  }

  public async init(): Promise<void> {
    const version = semver.coerce(karma.VERSION);
    if (!version || semver.lt(version, MIN_KARMA_VERSION)) {
      throw new Error(
        `Your karma version (${karma.VERSION}) is not supported. Please install ${MIN_KARMA_VERSION} or higher`,
      );
    }
    const browsersReadyPromise = StrykerReporter.instance.whenBrowsersReady();
    const { exitPromise } = await this.starter.start();
    this.exitPromise = exitPromise;
    const maybeExitCode = await Promise.race([
      browsersReadyPromise,
      exitPromise,
    ]);
    if (typeof maybeExitCode === 'number') {
      if (!this.isDisposed) {
        throw new Error(
          `Karma exited prematurely with exit code ${maybeExitCode}. Please run stryker with \`--logLevel trace\` to see the karma logging and figure out what's wrong.`,
        );
      }
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
    TestHooksMiddleware.instance.configureCoverageAnalysis(
      options.coverageAnalysis,
    );
    return await this.run();
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
    this.isDisposed = true;
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
    return Object.assign(
      defaultKarmaConfig,
      (options as KarmaRunnerOptionsWithStrykerOptions).karma,
    );
  }

  private runServer(): void {
    karma.runner.run(this.runConfig, (exitCode) => {
      this.log.debug('karma run done with ', exitCode);
    });
  }
}
