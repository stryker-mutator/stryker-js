import * as karma from 'karma';
import { StrykerOptions, MutantCoverage } from '@stryker-mutator/api/core';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import {
  TestRunner,
  TestResult,
  DryRunStatus,
  DryRunOptions,
  MutantRunOptions,
  DryRunResult,
  MutantRunResult,
  toMutantRunResult,
} from '@stryker-mutator/api/test-runner';

import { StrykerKarmaSetup } from '../src-generated/karma-runner-options';

import strykerKarmaConf = require('./starters/stryker-karma.conf');
import { ProjectStarter } from './starters/project-starter';
import { StrykerReporter } from './karma-plugins/stryker-reporter';
import { KarmaRunnerOptionsWithStrykerOptions } from './karma-runner-options-with-stryker-options';
import { TestHooksMiddleware } from './karma-plugins/test-hooks-middleware';

export interface ConfigOptions extends karma.ConfigOptions {
  detached?: boolean;
}

export class KarmaTestRunner implements TestRunner {
  private currentTestResults: TestResult[] = [];
  private currentErrorMessage: string | undefined;
  private currentCoverageReport?: MutantCoverage;
  private readonly starter: ProjectStarter;
  public port: undefined | number;

  public static inject = tokens(commonTokens.logger, commonTokens.getLogger, commonTokens.options);
  constructor(private readonly log: Logger, getLogger: LoggerFactoryMethod, options: StrykerOptions) {
    const setup = this.loadSetup(options);
    this.starter = new ProjectStarter(getLogger, setup);
    this.setGlobals(setup, getLogger);
    this.cleanRun();
    this.listenToServerStart();
    this.listenToSpecComplete();
    this.listenToCoverage();
    this.listenToError();
  }

  public async init(): Promise<void> {
    return new Promise((res, rej) => {
      StrykerReporter.instance.once('browsers_ready', () => res());
      this.starter.start().catch(rej);
    });
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
    if (!this.currentErrorMessage) {
      // Only run when there was no compile error
      // An compile error can happen in case of angular-cli
      await this.runServer();
    }
    const runResult = this.collectRunResult();
    this.cleanRun();
    return runResult;
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

  private cleanRun() {
    this.currentTestResults = [];
    this.currentErrorMessage = undefined;
    this.currentCoverageReport = undefined;
  }

  // Don't use dispose() to stop karma (using karma.stopper.stop)
  // It only works when in `detached` mode, as specified here: http://karma-runner.github.io/1.0/config/configuration-file.html

  private listenToSpecComplete() {
    StrykerReporter.instance.on('test_result', (testResult: TestResult) => {
      this.currentTestResults.push(testResult);
    });
  }

  private listenToServerStart() {
    StrykerReporter.instance.on('server_start', (port: number) => {
      this.port = port;
    });
  }

  private listenToCoverage() {
    StrykerReporter.instance.on('coverage_report', (coverageReport: MutantCoverage) => {
      this.currentCoverageReport = coverageReport;
    });
  }

  private listenToError() {
    StrykerReporter.instance.on('browser_error', (error: string) => {
      this.currentErrorMessage = error;
    });
    StrykerReporter.instance.on('compile_error', (errors: string[]) => {
      this.currentErrorMessage = errors.join(', ');
    });
  }

  private runServer() {
    return new Promise<void>((resolve) => {
      karma.runner.run({ port: this.port }, (exitCode) => {
        this.log.debug('karma run done with ', exitCode);
        resolve();
      });
    });
  }

  private collectRunResult(): DryRunResult {
    if (this.currentErrorMessage) {
      return {
        status: DryRunStatus.Error,
        errorMessage: this.currentErrorMessage,
      };
    } else {
      return {
        status: DryRunStatus.Complete,
        tests: this.currentTestResults,
        mutantCoverage: this.currentCoverageReport,
      };
    }
  }
}
