import { TestRunner, TestResult, TestStatus, RunStatus, RunResult, RunnerOptions, CoverageCollection, CoverageCollectionPerTest } from 'stryker-api/test_runner';
import * as karma from 'karma';
import * as log4js from 'log4js';
import * as _ from 'lodash';
import { EventEmitter } from 'events';
import * as rawCoverageReporter from './RawCoverageReporter';

const log = log4js.getLogger('KarmaTestRunner');

interface ConfigOptions extends karma.ConfigOptions {
  coverageReporter?: { type: string, dir?: string, subdir?: string };
  detached?: boolean;
}

interface KarmaSpec {
  description: string;
  id: string;
  skipped: boolean;
  success: boolean;
  time: number;
  suite: string[];
  log: string[];
}

const DEFAULT_OPTIONS: ConfigOptions = {
  browsers: ['PhantomJS'],
  frameworks: ['jasmine'],
  autoWatch: false,
  singleRun: false,
  detached: false
};

export default class KarmaTestRunner extends EventEmitter implements TestRunner {

  private server: karma.Server;
  private serverStartedPromise: Promise<void>;
  private currentTestResults: TestResult[];
  private currentErrorMessages: string[];
  private currentCoverageReport: CoverageCollection | CoverageCollectionPerTest;
  private currentRunResult: karma.TestResults;

  constructor(private options: RunnerOptions) {
    super();
    let karmaConfig = this.configureTestRunner(options.strykerOptions['karmaConfig']);
    karmaConfig = this.configureCoverageIfEnabled(karmaConfig);
    karmaConfig = this.configureProperties(karmaConfig);

    log.info(`using config ${JSON.stringify(karmaConfig)}`);
    this.server = new karma.Server(karmaConfig, function (exitCode) {
      process.exit(1);
    });

    this.listenToBrowserStarted();
    this.listenToRunComplete();
    this.listenToSpecComplete();
    this.listenToCoverage();
    this.listenToBrowserError();

    this.server.start();
  }

  init(): Promise<void> {
    return this.serverStartedPromise;
  }

  run(): Promise<RunResult> {
    this.currentTestResults = null;
    this.currentTestResults = [];
    this.currentErrorMessages = [];
    this.currentCoverageReport = null;
    this.currentRunResult = null;
    return this.runServer().then(() => this.collectRunResult());
  }

  dispose(): Promise<void> {
    return this.stopServer();
  }

  // Don't use dispose() to stop karma (using karma.stopper.stop)
  // It only works when in `detached` mode, as specified here: http://karma-runner.github.io/1.0/config/configuration-file.html

  private listenToBrowserStarted() {
    this.serverStartedPromise = new Promise<void>((res) => this.server.on('browsers_ready', res));
  }

  private listenToSpecComplete() {
    this.server.on('spec_complete', (browser: any, spec: KarmaSpec) => {
      const name = `${spec.suite.join(' ')} ${spec.description}`;
      let status = TestStatus.Failed;
      if (spec.skipped) {
        status = TestStatus.Skipped;
      } else if (spec.success) {
        status = TestStatus.Success;
      }
      this.currentTestResults.push({
        name,
        status,
        timeSpentMs: spec.time,
        failureMessages: spec.log
      });
    });
  }

  private listenToCoverage() {
    this.server.on('raw_coverage_complete', (coverageReport: CoverageCollection | CoverageCollectionPerTest) => {
      this.currentCoverageReport = coverageReport;
    });
  }

  private listenToRunComplete() {
    this.server.on('run_complete', (browsers, runResult) => {
      this.currentRunResult = runResult;
    });
  }

  private listenToBrowserError() {
    this.server.on('browser_error', (browser: any, error: any) => {
      this.currentErrorMessages.push(error.toString());
    });
  }

  private configureProperties(karmaConfig: ConfigOptions) {
    karmaConfig.autoWatch = false;
    karmaConfig.singleRun = false;
    return karmaConfig;
  }

  private configureCoverageIfEnabled(karmaConfig: ConfigOptions) {
    if (this.options.strykerOptions.coverageAnalysis !== 'off') {
      this.configureCoverageReporters(karmaConfig);
      this.configureCoveragePlugin(karmaConfig);
    }
    return karmaConfig;
  }

  private configureCoverageReporters(karmaConfig: ConfigOptions) {
    if (!karmaConfig.reporters) {
      karmaConfig.reporters = [];
    }
    karmaConfig.reporters.push('rawCoverage');
  }

  private configureCoveragePlugin(karmaConfig: ConfigOptions) {
    if (!karmaConfig.plugins) {
      karmaConfig.plugins = ['karma-*'];
    }
    karmaConfig.plugins.push(rawCoverageReporter);
  }

  private configureTestRunner(overrides: ConfigOptions) {
    // Merge defaults with given
    let karmaConfig = _.assign<ConfigOptions, ConfigOptions>(_.cloneDeep(DEFAULT_OPTIONS), overrides);

    // Override files
    karmaConfig.files = this.options.files.map(file => ({ pattern: file.path, included: file.included }));

    // Override port
    karmaConfig.port = this.options.port;

    // Override browserNoActivityTimeout. Default value 10000 might not enought to send perTest coverage results
    karmaConfig.browserNoActivityTimeout = 1000000;

    // Override frameworks
    if (this.options.strykerOptions.testFramework && !(overrides && overrides.frameworks)) {
      karmaConfig.frameworks = [this.options.strykerOptions.testFramework];
    }

    return karmaConfig;
  }

  private stopServer() {
    return new Promise<void>(resolve => {
      karma.stopper.stop({ port: this.options.port }, exitCode => {
        log.info('karma stopped on command with %s', exitCode);
        resolve();
      });
    });
  }

  private runServer() {
    return new Promise<void>(resolve => {
      karma.runner.run({ port: this.options.port }, (exitCode) => {
        log.info('karma run done with ', exitCode);
        resolve();
      });
    });
  }

  private collectRunResult(): RunResult {
    return {
      tests: this.currentTestResults,
      status: this.collectRunState(),
      coverage: this.currentCoverageReport,
      errorMessages: this.currentErrorMessages
    };
  }

  private collectRunState(): RunStatus {
    if (this.currentRunResult.disconnected) {
      return RunStatus.Timeout;
    } else if (this.currentRunResult.error && this.currentErrorMessages.length > 0) {
      return RunStatus.Error;
    } else {
      return RunStatus.Complete;
    }
  }
}
