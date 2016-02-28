import TestRunner from '../api/TestRunner';
import TestRunResult from '../api/TestRunResult';
import TestResult from '../api/TestResult';
import StrykerOptions from '../api/StrykerOptions';
import * as karma from 'karma';
import * as _ from 'lodash';
import TestRunnerOptions from '../api/TestRunnerOptions';
import * as fs from 'fs';

interface ConfigOptions extends karma.ConfigOptions {
  coverageReporter: { type: string, dir: string, subdir: string }
}

const DEFAULT_OPTIONS: ConfigOptions = {
  browsers: ['PhantomJS'],
  frameworks: ['jasmine'],
  autoWatch: false,
  singleRun: false,
  plugins: ['karma-jasmine', 'karma-phantomjs-launcher'],
  reporters: ['coverage'],
  coverageReporter: {
    type: 'json',
    dir: 'coverage',
    subdir: 'json'
  }
}

export default class KarmaTestRunner extends TestRunner {

  private server: karma.Server;
  private serverStartedPromise: Promise<Object>;
  private currentTestResults: karma.TestResults;
  private currentSpecNames: string[];

  constructor(sourceFiles: string[], files: string[], runnerOptions: TestRunnerOptions, strykerOptions: StrykerOptions) {
    super(sourceFiles, files, runnerOptions, strykerOptions);

    let karmaConfig = KarmaTestRunner.overrideOptions(strykerOptions['karmaRunner']);
    karmaConfig = this.configureTestRunner(karmaConfig);
    
    console.log(`starting server usign config ${JSON.stringify(karmaConfig)}`);
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
      console.log('spec_completed', specName);
      this.currentSpecNames.push(specName);
    });
  }

  private listenToRunComplete() {
    this.server.on('run_complete', (browsers, results) => {
      console.log('run_complete', results);
      this.currentTestResults = results;
    });
  }

  private static overrideOptions(karmaRunnerOptions: any) {
    return _.assign<ConfigOptions, ConfigOptions>(_.clone(DEFAULT_OPTIONS), karmaRunnerOptions);
  }

  private configureTestRunner(karmaConfig: ConfigOptions) {
    if (!karmaConfig.preprocessors) {
      karmaConfig.preprocessors = {};
    }
    this.sourceFiles.forEach(sourceFile => karmaConfig.preprocessors[sourceFile] = karmaConfig.preprocessors[`../${sourceFile}`] = 'coverage');
    karmaConfig.coverageReporter.dir = `${this.runnerOptions.tempFolder}/coverage`;

    karmaConfig.files = [];
    this.sourceFiles.forEach(file => karmaConfig.files.push(file));
    this.files.forEach(file => karmaConfig.files.push(file));

    karmaConfig.plugins.push('karma-coverage');
    karmaConfig.port = this.runnerOptions.port;
    return karmaConfig;
  }

  private runServer() {
    return new Promise<void>((resolve) => {
      let p = this.runnerOptions.port;
      karma.runner.run({ port: p }, (exitCode) => {
        console.log('run_complete', exitCode);
        resolve();
      });
    });
  }

  run(): Promise<TestRunResult> {
    return this.serverStartedPromise.then(() => new Promise<TestRunResult>((resolve) => {
      console.log('Server up, starting run');
      this.currentTestResults = null;
      this.currentSpecNames = []
      this.runServer().then(testResults => {
        console.log('run done, resolving original promise');
        var convertedTestResult = this.convertResult(this.currentTestResults);
        resolve(convertedTestResult);
      });
    }), err => { console.log('ERROR: ', err); });
  }

  private convertResult(testResults: karma.TestResults): TestRunResult {
    return {
      specNames: this.currentSpecNames,
      result: KarmaTestRunner.convertTestResult(testResults),
      succeeded: testResults.success,
      failed: testResults.failed,
      coverage: this.collectCoverage()
    }
  }

  listFiles(dir: any, filelist?: any) {
    var fs: any = fs || require('fs'),
      files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach((file: any) => {
      if (fs.statSync(dir + file).isDirectory()) {
        filelist = this.listFiles(dir + file + '/', filelist);
      }
      else {
        filelist.push(file);
      }
    });
    return filelist;
  };


  private collectCoverage() {
    console.log('collecting coverage, folder structure in temp folder:');
    var coverage: any;
    try {
      this.listFiles(this.runnerOptions.tempFolder + '/').forEach((file: string) => {
        console.log(file);
      });

      coverage = JSON.parse(fs.readFileSync(`${this.runnerOptions.tempFolder}/coverage/json/coverage-final.json`, 'utf8'));
      console.log('coverage report', coverage);
    } catch (error) {
      console.log('ERROR while trying to read code coverage: ', error);
    }
    return coverage;
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