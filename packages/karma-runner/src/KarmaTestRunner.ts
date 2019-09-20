import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { CoverageCollection, CoveragePerTestResult, RunResult, RunStatus, TestResult, TestRunner } from '@stryker-mutator/api/test_runner';
import * as karma from 'karma';
import ProjectStarter from './starters/ProjectStarter';
import strykerKarmaConf = require('./starters/stryker-karma.conf');
import StrykerKarmaSetup, { KARMA_CONFIG_KEY } from './StrykerKarmaSetup';
import StrykerReporter from './StrykerReporter';
import TestHooksMiddleware from './TestHooksMiddleware';

export interface ConfigOptions extends karma.ConfigOptions {
  detached?: boolean;
}

export default class KarmaTestRunner implements TestRunner {
  private currentTestResults: TestResult[];
  private currentErrorMessages: string[];
  private currentCoverageReport?: CoverageCollection | CoveragePerTestResult;
  private currentRunStatus: RunStatus;
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
    this.listenToRunComplete();
    this.listenToSpecComplete();
    this.listenToCoverage();
    this.listenToError();
  }

  public init(): Promise<void> {
    return new Promise((res, rej) => {
      StrykerReporter.instance.once('browsers_ready', res);
      this.starter
        .start()
        .then(() => {
          /*noop*/
        })
        .catch(rej);
    });
  }

  public async run({ testHooks }: { testHooks?: string }): Promise<RunResult> {
    this.testHooksMiddleware.currentTestHooks = testHooks || '';
    if (this.currentRunStatus !== RunStatus.Error) {
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
      projectType: 'custom'
    };
    return Object.assign(defaultKarmaConfig, options[KARMA_CONFIG_KEY]);
  }

  private setGlobals(setup: StrykerKarmaSetup, getLogger: LoggerFactoryMethod) {
    strykerKarmaConf.setGlobals({
      getLogger,
      karmaConfig: setup.config,
      karmaConfigFile: setup.configFile
    });
  }

  private cleanRun() {
    this.currentTestResults = [];
    this.currentErrorMessages = [];
    this.currentCoverageReport = undefined;
    this.currentRunStatus = RunStatus.Complete;
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
    StrykerReporter.instance.on('server_start', () => {});
  }

  private listenToCoverage() {
    StrykerReporter.instance.on('coverage_report', (coverageReport: CoverageCollection | CoveragePerTestResult) => {
      this.currentCoverageReport = coverageReport;
    });
  }

  private listenToRunComplete() {
    StrykerReporter.instance.on('run_complete', (runStatus: RunStatus) => {
      this.currentRunStatus = runStatus;
    });
  }

  private listenToError() {
    StrykerReporter.instance.on('browser_error', (error: string) => {
      this.currentErrorMessages.push(error);
    });
    StrykerReporter.instance.on('compile_error', (errors: string[]) => {
      errors.forEach(error => this.currentErrorMessages.push(error));
      this.currentRunStatus = RunStatus.Error;
    });
  }

  private runServer() {
    return new Promise<void>(resolve => {
      karma.runner.run({ port: this.port }, exitCode => {
        this.log.debug('karma run done with ', exitCode);
        resolve();
      });
    });
  }

  private collectRunResult(): RunResult {
    return {
      coverage: this.currentCoverageReport,
      errorMessages: this.currentErrorMessages,
      status: this.determineRunState(),
      tests: this.currentTestResults
    };
  }

  private determineRunState() {
    // Karma will report an Error if no tests had executed.
    // This is not an "error" in Stryker terms
    if (this.currentRunStatus === RunStatus.Error && !this.currentErrorMessages.length && !this.currentTestResults.length) {
      return RunStatus.Complete;
    } else if (this.currentErrorMessages.length) {
      // Karma will return Complete when there are runtime errors
      return RunStatus.Error;
    } else {
      return this.currentRunStatus;
    }
  }
}
