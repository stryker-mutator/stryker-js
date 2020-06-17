import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import * as karma from 'karma';

import strykerKarmaConf = require('./starters/stryker-karma.conf');
import { StrykerKarmaSetup } from '../src-generated/karma-runner-options';
import {
  TestRunner2,
  TestResult,
  MutantCoverage,
  RunStatus,
  DryRunOptions,
  MutantRunOptions,
  DryRunResult,
  MutantRunResult,
  toMutantRunResult,
} from '../../api/test_runner2';

import ProjectStarter from './starters/ProjectStarter';
import StrykerReporter from './StrykerReporter';
import TestHooksMiddleware from './TestHooksMiddleware';
import { KarmaRunnerOptionsWithStrykerOptions } from './KarmaRunnerOptionsWithStrykerOptions';

export interface ConfigOptions extends karma.ConfigOptions {
  detached?: boolean;
}

export default class KarmaTestRunner implements TestRunner2 {
  private currentTestResults: TestResult[];
  private currentErrorMessage: string | undefined;
  private currentCoverageReport?: MutantCoverage;
  private readonly testHooksMiddleware = TestHooksMiddleware.instance;
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
    return this.run({});
  }
  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    const dryRunResult = await this.run({});
    return toMutantRunResult(dryRunResult);
  }

  private async run({ testHooks }: { testHooks?: string }): Promise<DryRunResult> {
    this.testHooksMiddleware.currentTestHooks = testHooks || '';
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
        status: RunStatus.Error,
        errorMessage: this.currentErrorMessage,
      };
    } else {
      return {
        status: RunStatus.Complete,
        tests: this.currentTestResults,
        mutantCoverage: this.currentCoverageReport,
      };
    }
  }
}
