import {TestRunner, TestResult, RunResult, RunnerOptions, CoverageCollection} from 'stryker-api/test_runner';
import * as karma from 'karma';
import * as _ from 'lodash';
import * as log4js from 'log4js';

const log = log4js.getLogger('KarmaTestRunner');

interface ConfigOptions extends karma.ConfigOptions {
  coverageReporter?: { type: string, dir?: string, subdir?: string }
}

const DEFAULT_OPTIONS: ConfigOptions = {
  browsers: ['PhantomJS'],
  frameworks: ['jasmine'],
  autoWatch: false,
  singleRun: false
}

const DEFAULT_COVERAGE_REPORTER = {
  coverageReporter: {
    type: 'in-memory'
  }
}

export default class KarmaTestRunner implements TestRunner {

  private server: karma.Server;
  private serverStartedPromise: Promise<Object>;
  private currentTestResults: karma.TestResults;
  private currentSpecNames: string[];
  private currentErrorMessages: string[];
  private currentCoverageReport: CoverageCollection;

  constructor(private options: RunnerOptions) {
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

  private listenToBrowserStarted() {
    this.serverStartedPromise = new Promise((res) => {
      this.server.on('browsers_ready', res);
    });
  }

  private listenToSpecComplete() {
    this.server.on('spec_complete', (browser: any, spec: any) => {
      let specName = `${spec.suite.join(' ')} ${spec.description}`;
      this.currentSpecNames.push(specName);
    });
  }

  private listenToCoverage() {
    this.server.on('coverage_complete', (browser: any, coverageReport: CoverageCollection) => {
      this.currentCoverageReport = coverageReport;
    });
  }

  private listenToRunComplete() {
    this.server.on('run_complete', (browsers, results) => {
      this.currentTestResults = results;
    });
  }

  private listenToBrowserError() {
    this.server.on('browser_error', (browser: any, error: any) => {
      this.currentErrorMessages.push(error);
    });
  }

  private configureProperties(karmaConfig: ConfigOptions) {
    karmaConfig.autoWatch = false;
    karmaConfig.singleRun = false;
    return karmaConfig;
  }

  private configureCoverageIfEnabled(karmaConfig: ConfigOptions) {
    if (this.options.coverageEnabled) {
      karmaConfig = _.assign(karmaConfig, _.cloneDeep(DEFAULT_COVERAGE_REPORTER));
      this.configureCoveragePreprocessors(karmaConfig);
      this.configureCoverageReporters(karmaConfig);
      this.configureCoveragePlugin(karmaConfig);
    }
    return karmaConfig;
  }

  private configureCoveragePlugin(karmaConfig: ConfigOptions) {
    if (karmaConfig.plugins) { // by default, all plugins are loaded (starting with `karma-*`)
      karmaConfig.plugins.push('karma-coverage');
    }
  }

  private configureCoverageReporters(karmaConfig: ConfigOptions) {
    if (!karmaConfig.reporters) {
      karmaConfig.reporters = [];
    }
    karmaConfig.reporters.push('coverage');
  }

  private configureCoveragePreprocessors(karmaConfig: ConfigOptions) {
    if (!karmaConfig.preprocessors) {
      karmaConfig.preprocessors = {};
    }
    this.options.files.forEach(file => {
      if (file.shouldMutate) {
        let preprocessor = karmaConfig.preprocessors[file.path];
        if (!preprocessor) {
          karmaConfig.preprocessors[file.path] = 'coverage';
        } else {
          if (Array.isArray(preprocessor)) {
            preprocessor.push('coverage');
          } else {
            karmaConfig.preprocessors[file.path] = ['coverage', preprocessor];
          }
        }
      }
    });
  }

  private configureTestRunner(karmaConfig: ConfigOptions) {
    // Merge defaults with given
    karmaConfig = _.assign<ConfigOptions, ConfigOptions>(_.cloneDeep(DEFAULT_OPTIONS), karmaConfig);

    // Override files
    karmaConfig.files = [];
    this.options.files.forEach(file => karmaConfig.files.push(file.path));

    // Override port
    karmaConfig.port = this.options.port;

    return karmaConfig;
  }

  private runServer() {
    return new Promise<void>((resolve) => {
      let p = this.options.port;
      karma.runner.run({ port: p }, (exitCode) => {
        log.info('karma run done with ', exitCode);
        resolve();
      });
    });
  }

  run(): Promise<RunResult> {
    return this.serverStartedPromise.then(() => new Promise<RunResult>((resolve) => {
      this.currentTestResults = null;
      this.currentSpecNames = [];
      this.currentErrorMessages = [];
      this.currentCoverageReport = null;
      this.runServer().then(() => {
        resolve(this.convertResult(this.currentTestResults));
      });
    }));
  }

  private convertResult(testResults: karma.TestResults): RunResult {
    return {
      testNames: this.currentSpecNames,
      result: this.convertTestResult(testResults),
      succeeded: testResults.success,
      failed: testResults.failed,
      coverage: this.currentCoverageReport,
      errorMessages: this.currentErrorMessages
    }
  }

  private convertTestResult(testResults: karma.TestResults) {
    if (testResults.error) {
      if (this.currentErrorMessages.length > 0) {
        // The error flag is set by default, even if no tests have ran. 
        return TestResult.Error;
      } else {
        return TestResult.Complete;
      }
    } else if (testResults.disconnected) {
      return TestResult.Timeout;
    } else {
      return TestResult.Complete;
    }
  }
}
