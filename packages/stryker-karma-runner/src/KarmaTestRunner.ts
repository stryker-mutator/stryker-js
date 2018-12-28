import { TestRunner, TestResult, RunStatus, RunResult, RunnerOptions, CoverageCollection, CoveragePerTestResult } from 'stryker-api/test_runner';
import { getLogger } from 'stryker-api/logging';
import * as karma from 'karma';
import StrykerKarmaSetup, { DEPRECATED_KARMA_CONFIG, DEPRECATED_KARMA_CONFIG_FILE, KARMA_CONFIG_KEY } from './StrykerKarmaSetup';
import TestHooksMiddleware from './TestHooksMiddleware';
import StrykerReporter from './StrykerReporter';
import strykerKarmaConf = require('./starters/stryker-karma.conf');
import ProjectStarter from './starters/ProjectStarter';

export interface ConfigOptions extends karma.ConfigOptions {
  detached?: boolean;
}

export default class KarmaTestRunner implements TestRunner {
  private readonly log = getLogger(KarmaTestRunner.name);
  private currentTestResults: TestResult[];
  private currentErrorMessages: string[];
  private currentCoverageReport?: CoverageCollection | CoveragePerTestResult;
  private currentRunStatus: RunStatus;
  private readonly testHooksMiddleware = TestHooksMiddleware.instance;
  private readonly starter: ProjectStarter;
  public port: undefined | number;

  constructor(options: RunnerOptions) {
    const setup = this.loadSetup(options);
    if (setup.project !== undefined) {
      setup.projectType = setup.project;
      this.log.warn('DEPRECATED: `karma.project` is renamed to `karma.projectType`. Please change it in your stryker configuration.');
    }
    this.starter = new ProjectStarter(setup);
    this.setGlobals(setup);
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
      this.starter.start()
        .then(() => { /*noop*/ })
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

  private loadSetup(settings: RunnerOptions): StrykerKarmaSetup {
    const defaultKarmaConfig: StrykerKarmaSetup = {
      projectType: 'custom'
    };
    const strykerKarmaSetup: StrykerKarmaSetup = Object.assign(defaultKarmaConfig, settings.strykerOptions[KARMA_CONFIG_KEY]);

    const loadDeprecatedOption = (configKey: keyof StrykerKarmaSetup, deprecatedConfigOption: string) => {
      if (!strykerKarmaSetup[configKey] && settings.strykerOptions[deprecatedConfigOption]) {
        this.log.warn(`[deprecated]: config option ${deprecatedConfigOption} is renamed to ${KARMA_CONFIG_KEY}.${configKey}`);
        strykerKarmaSetup[configKey] = settings.strykerOptions[deprecatedConfigOption];
      }
    };
    loadDeprecatedOption('configFile', DEPRECATED_KARMA_CONFIG_FILE);
    loadDeprecatedOption('config', DEPRECATED_KARMA_CONFIG);
    return strykerKarmaSetup;
  }

  private setGlobals(setup: StrykerKarmaSetup) {
    strykerKarmaConf.setGlobals({
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
    StrykerReporter.instance.on('server_start', () => { });
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
    if (this.currentRunStatus === RunStatus.Error &&
      !this.currentErrorMessages.length &&
      !this.currentTestResults.length) {
      return RunStatus.Complete;
    } else if (this.currentErrorMessages.length) {
      // Karma will return Complete when there are runtime errors
      return RunStatus.Error;
    } else {
      return this.currentRunStatus;
    }
  }
}
