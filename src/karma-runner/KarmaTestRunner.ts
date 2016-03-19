import {TestRunner, TestResult, RunResult, RunnerOptions, CoverageCollection, TestRunnerFactory} from '../api/test_runner';
import * as karma from 'karma';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

interface ConfigOptions extends karma.ConfigOptions {
  coverageReporter?: { type: string, dir?: string, subdir?: string }
}

const DEFAULT_OPTIONS: ConfigOptions = {
  browsers: ['PhantomJS'],
  frameworks: ['jasmine'],
  autoWatch: false,
  singleRun: false,
  plugins: ['karma-jasmine', 'karma-phantomjs-launcher']
}

const DEFAULT_COVERAGE_REPORTER = {
  coverageReporter: {
    type: 'in-memory'
  }
}

export default class KarmaTestRunner extends TestRunner {

  private server: karma.Server;
  private serverStartedPromise: Promise<Object>;
  private currentTestResults: karma.TestResults;
  private currentSpecNames: string[];
  private currentCoverageReport: CoverageCollection;

  constructor(runnerOptions: RunnerOptions) {
    super(runnerOptions);

    let karmaConfig = this.configureTestRunner(runnerOptions.strykerOptions['karma']);
    karmaConfig = this.configureCoverageIfEnabled(karmaConfig);

    console.log(`using config ${JSON.stringify(karmaConfig)}`);
    this.server = new karma.Server(karmaConfig, function(exitCode) {
      process.exit(1);
    });

    this.listenToBrowserStarted();
    this.listenToRunComplete();
    this.listenToSpecComplete();
    this.listenToCoverage();

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
  
  private listenToCoverage(){
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
      console.log('ERROR: ', error);
    });
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

  private configureCoveragePlugin(karmaConfig: ConfigOptions){
    karmaConfig.plugins.push('karma-coverage');
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
    this.options.sourceFiles.forEach(sourceFile => {
      let preprocessor = karmaConfig.preprocessors[sourceFile];
      if (!preprocessor) {
        karmaConfig.preprocessors[sourceFile] = 'coverage';
      } else {
        if (Array.isArray(preprocessor)) {
          preprocessor.push('coverage');
        } else {
          karmaConfig.preprocessors[sourceFile] = ['coverage', preprocessor];
        }
      }
    });
  }

  private configureTestRunner(karmaConfig: ConfigOptions) {
    // Merge defaults with given
    karmaConfig = _.assign<ConfigOptions, ConfigOptions>(_.cloneDeep(DEFAULT_OPTIONS), karmaConfig);
    
    // Override files
    karmaConfig.files = [];
    this.options.sourceFiles.forEach(file => karmaConfig.files.push(file));
    this.options.additionalFiles.forEach(file => karmaConfig.files.push(file));
    
    // Override port
    karmaConfig.port = this.options.port;

    return karmaConfig;
  }

  private runServer() {
    return new Promise<void>((resolve) => {
      let p = this.options.port;
      karma.runner.run({ port: p }, (exitCode) => {
        console.log('karma run done with ', exitCode);
        resolve();
      });
    });
  }

  run(): Promise<RunResult> {
    return this.serverStartedPromise.then(() => new Promise<RunResult>((resolve) => {
      this.currentTestResults = null;
      this.currentSpecNames = [];
      this.currentCoverageReport = null;
      this.runServer().then(() => {
          resolve(this.convertResult(this.currentTestResults));
      });
    }));
  }

  private convertResult(testResults: karma.TestResults): RunResult {
    return {
      specNames: this.currentSpecNames,
      result: KarmaTestRunner.convertTestResult(testResults),
      succeeded: testResults.success,
      failed: testResults.failed,
      coverage: this.currentCoverageReport
    }
  }

  private static convertTestResult(testResults: karma.TestResults) {
    if (testResults.error) {
      return TestResult.Error;
    } else if (testResults.disconnected) {
      return TestResult.Timeout;
    } else {
      return TestResult.Complete;
    }
  }
}

TestRunnerFactory.instance().register('karma', KarmaTestRunner);