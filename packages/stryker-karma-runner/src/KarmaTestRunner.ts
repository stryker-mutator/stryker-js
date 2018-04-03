import * as log4js from 'log4js';
import { TestRunner, TestResult, TestStatus, RunStatus, RunResult, RunnerOptions, CoverageCollection, CoveragePerTestResult } from 'stryker-api/test_runner';
import * as karma from 'karma';
import * as rawCoverageReporter from './RawCoverageReporter';
import { KARMA_CONFIG } from './configKeys';
import TestHooksMiddleware, { TEST_HOOKS_FILE_NAME } from './TestHooksMiddleware';
import { touchSync } from './utils';
import { setGlobalLogLevel } from 'log4js';

export interface ConfigOptions extends karma.ConfigOptions {
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

const FORCED_OPTIONS = (() => {
  const config: ConfigOptions = {
    // Override browserNoActivityTimeout. Default value 10000 might not enough to send perTest coverage results
    browserNoActivityTimeout: 1000000,
    // Override base, we don't want to original karma baseDir to be interfering with the stryker setup
    basePath: '.',
    // No auto watch, stryker will inform us when we need to test
    autoWatch: false,
    // Don't stop after first run
    singleRun: false,
    // Never detach, always run in this same process (is already a separate process)
    detached: false
  };
  return Object.freeze(config);
})();

function defaultOptions(): Readonly<ConfigOptions> {
  return Object.freeze({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
  });
}

export default class KarmaTestRunner implements TestRunner {

  private log = log4js.getLogger(KarmaTestRunner.name);
  private server: karma.Server;
  private serverStartedPromise: Promise<void>;
  private currentTestResults: TestResult[];
  private currentErrorMessages: string[];
  private currentCoverageReport?: CoverageCollection | CoveragePerTestResult;
  private currentRunResult: karma.TestResults;
  private readonly testHooksMiddleware = new TestHooksMiddleware();

  constructor(private options: RunnerOptions) {
    setGlobalLogLevel(options.strykerOptions.logLevel || 'info');
    let karmaConfig = this.configureTestRunner(options.strykerOptions[KARMA_CONFIG]);
    karmaConfig = this.configureCoverageIfEnabled(karmaConfig);
    karmaConfig = this.configureProperties(karmaConfig);
    karmaConfig = this.configureTestHooksMiddleware(karmaConfig);

    this.log.debug(`using config ${JSON.stringify(karmaConfig, null, 2)}`);
    this.server = new karma.Server(karmaConfig, function (exitCode) {
      process.exit(exitCode);
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

  run({ testHooks }: { testHooks?: string }): Promise<RunResult> {
    this.testHooksMiddleware.currentTestHooks = testHooks || '';
    this.currentTestResults = [];
    this.currentErrorMessages = [];
    this.currentCoverageReport = undefined;
    this.currentRunResult = {
      disconnected: false,
      error: false,
      exitCode: 0,
      failed: 0,
      success: 0
    };
    return this.runServer().then(() => this.collectRunResult());
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
    this.server.on('raw_coverage_complete', (coverageReport: CoverageCollection | CoveragePerTestResult) => {
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
      // Karma 2.0 has different error messages
      if (error.message) {
        this.currentErrorMessages.push(error.message);
      } else {
        this.currentErrorMessages.push(error.toString());
      }
    });
  }

  private configureProperties(karmaConfig: ConfigOptions) {
    karmaConfig.autoWatch = false;
    karmaConfig.singleRun = false;
    return karmaConfig;
  }

  /**
   * Configures the test hooks middleware. 
   * It adds a non-existing file to the top `files` array. 
   * Further more it configures a middleware that serves the file.
   */
  private configureTestHooksMiddleware(karmaConfig: ConfigOptions): ConfigOptions {
    // Add test run middleware file
    karmaConfig.files = karmaConfig.files || [];
    karmaConfig.files.unshift({ pattern: TEST_HOOKS_FILE_NAME, included: true, watched: false, served: false, nocache: true }); // Add a custom hooks file to provide hooks
    const middleware: string[] = (karmaConfig as any).middleware || ((karmaConfig as any).middleware = []);
    middleware.unshift(TestHooksMiddleware.name);
    karmaConfig.plugins = karmaConfig.plugins || [];
    karmaConfig.plugins.push({
      [`middleware:${TestHooksMiddleware.name}`]: ['value', this.testHooksMiddleware.handler()]
    });
    touchSync(TEST_HOOKS_FILE_NAME); // Make sure it exists so karma doesn't log a warning
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
    let karmaConfig = Object.assign<ConfigOptions, ConfigOptions, ConfigOptions>({}, defaultOptions(), overrides);

    // Override port
    karmaConfig.port = this.options.port;

    this.forceOptions(karmaConfig);

    // Override frameworks
    if (this.options.strykerOptions.testFramework && !(overrides && overrides.frameworks)) {
      karmaConfig.frameworks = [this.options.strykerOptions.testFramework];
    }

    return karmaConfig;
  }

  /**
   * Some options cannot be configured by the user (like timeout, reporter, etc).
   * This method forces that options on given karma config.
   * @param karmaConfig The karma config on which options need to be forced
   */
  private forceOptions(karmaConfig: ConfigOptions) {
    let i: keyof ConfigOptions;
    for (i in FORCED_OPTIONS) {
      karmaConfig[i] = FORCED_OPTIONS[i];
    }
  }

  private runServer() {
    return new Promise<void>(resolve => {
      karma.runner.run({ port: this.options.port }, (exitCode) => {
        this.log.info('karma run done with ', exitCode);
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
