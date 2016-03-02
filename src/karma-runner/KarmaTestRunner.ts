import {TestRunner, TestResult, RunResult as TestRunResult, RunnerOptions as TestRunnerOptions, CoverageCollection} from '../api/test_runner';
import {StrykerOptions} from '../api/core';
import * as karma from 'karma';
import * as _ from 'lodash';
import * as fs from 'fs';
import FileUtils from '../utils/FileUtils';
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
    type: 'json',
    subdir: 'json'
  }
}

export default class KarmaTestRunner extends TestRunner {

  private coverageFolder = `${os.tmpdir()}${path.sep}coverage-result-${Math.ceil(Math.random() * 1000000)}`;
  private server: karma.Server;
  private serverStartedPromise: Promise<Object>;
  private currentTestResults: karma.TestResults;
  private currentSpecNames: string[];

  constructor(sourceFiles: string[], files: string[], runnerOptions: TestRunnerOptions, strykerOptions: StrykerOptions) {
    super(sourceFiles, files, runnerOptions, strykerOptions);

    let karmaConfig = this.configureTestRunner(strykerOptions['karma']);
    karmaConfig = this.configureCoverageIfEnabled(karmaConfig);

    console.log(`using config ${JSON.stringify(karmaConfig)}`);
    this.server = new karma.Server(karmaConfig, function(exitCode) {
      process.exit(1);
    });

    this.listenToBrowserStarted();
    this.listenToRunComplete();
    this.listenToSpecComplete();

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
    if (this.runnerOptions.coverageEnabled) {
      karmaConfig = _.assign(karmaConfig, _.cloneDeep(DEFAULT_COVERAGE_REPORTER));
      this.configureCoveragePreprocessors(karmaConfig);
      this.configureCoverageReporters(karmaConfig);
      this.configureCoverageDir(karmaConfig);
      this.configureCoveragePlugin(karmaConfig);
    }
    return karmaConfig;
  }

  private configureCoveragePlugin(karmaConfig: ConfigOptions){
    karmaConfig.plugins.push('karma-coverage');
  }

  private configureCoverageDir(karmaConfig: ConfigOptions) {
    try {
      fs.lstatSync(this.coverageFolder);
    } catch (errror) {
      fs.mkdirSync(this.coverageFolder);
    }
    karmaConfig.coverageReporter.dir = this.coverageFolder;
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
    this.sourceFiles.forEach(sourceFile => {
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
    this.sourceFiles.forEach(file => karmaConfig.files.push(file));
    this.files.forEach(file => karmaConfig.files.push(file));
    
    // Override port
    karmaConfig.port = this.runnerOptions.port;

    return karmaConfig;
  }

  private runServer() {
    return new Promise<void>((resolve) => {
      let p = this.runnerOptions.port;
      karma.runner.run({ port: p }, (exitCode) => {
        console.log('karma exit with', exitCode);
        resolve();
      });
    });
  }

  run(): Promise<TestRunResult> {
    return this.serverStartedPromise.then(() => new Promise<TestRunResult>((resolve) => {
      this.currentTestResults = null;
      this.currentSpecNames = []
      this.runServer().then(testResults => {
        if (this.runnerOptions.coverageEnabled) {
          this.collectCoverage().then(coverage => {
            var convertedTestResult = this.convertResult(this.currentTestResults, coverage);
            resolve(convertedTestResult);
          });
        } else {
          resolve(this.convertResult(this.currentTestResults));
        }
      }, err => console.error('ERROR: ', err));
    }), err => { console.error('ERROR: ', err); });
  }

  private convertResult(testResults: karma.TestResults, coverage: CoverageCollection = null): TestRunResult {
    return {
      specNames: this.currentSpecNames,
      result: KarmaTestRunner.convertTestResult(testResults),
      succeeded: testResults.success,
      failed: testResults.failed,
      coverage: coverage
    }
  }

  private collectCoverage() {
    return new Promise<CoverageCollection>(resolve => {
      let coverage: CoverageCollection;
      let nrOfTries = 0;
      let coveragePath = `${this.coverageFolder}/json/coverage-final.json`;
      let tryReportCoverage = () => {
        try {
          coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
          resolve(coverage);
        } catch (error) {
          // Added this timeout to make sure the coverage report is written. Remove in the future if we have an other way to make sure it is written
          if (nrOfTries > 2) {
            console.error('ERROR while trying to read code coverage: ', error);
            resolve(null);
          } else {
            nrOfTries++;
            setTimeout(tryReportCoverage, 10);
          }
        }
      };
      tryReportCoverage();
    });
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