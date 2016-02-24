'use strict';

import * as _ from 'lodash';
import {fork} from 'child_process';
import * as path from 'path';
import * as karma from 'karma';
import BaseTestRunner, {TestCompletedCallback, TestsCompletedCallback} from './BaseTestRunner';
import FileUtils from '../utils/FileUtils';
import TestFile from '../TestFile';
import TestResult from '../TestResult';
import TestRunnerConfig from './TestRunnerConfig';
import TestsRunResults from './TestsRunResults';

export interface ConfigOptionsIncludingCoverage extends karma.ConfigOptions{
  coverageReporter? : {
        type: string,
        dir: string,
        subdir: string
      };
}

export default class KarmaTestRunner extends BaseTestRunner {
  
  protected _fileUtils = new FileUtils();
 
  constructor(protected karmaConfig: ConfigOptionsIncludingCoverage){
    super(karmaConfig);
  }

  test(config: TestRunnerConfig, sourceFiles: string[], testFiles: TestFile[], testCompletedCallback: TestCompletedCallback) {
    super.test(config, sourceFiles, testFiles, testCompletedCallback);

    if (testFiles.length > 0) {
      config.files = sourceFiles.concat(config.libs, testFiles.map( file => file.getPath()));

      config.browserNoActivityTimeout = this.getTotalTimeout();

      var serverProcess = fork(__dirname + '/KarmaServerWorker.js', undefined, {
        silent: true
      });

      serverProcess.on('message', function(result: TestsRunResults) {
        var testResult = new TestResult(sourceFiles, testFiles, result.success, result.failed, result.disconnected, result.error, result.timeSpent);
        testCompletedCallback(testResult);
      });

      serverProcess.send(config);

    } else {
      var testResult = new TestResult(sourceFiles, testFiles, 0, 0, false, false, 0);
      testCompletedCallback(testResult);
    }
  };

  testAndCollectCoverage(sourceFiles: string[], testFiles: string[], testCompletedCallback: TestsCompletedCallback) {
    super.testAndCollectCoverage(sourceFiles, testFiles, testCompletedCallback);
    var dirname = this._fileUtils.getBaseTempFolder();
    var subdir = 'coverage';

    this.karmaConfig.reporters = ['coverage'];
    this.karmaConfig.preprocessors = {};
    _.forEach(sourceFiles, (sourceFile) => {
      this.karmaConfig.preprocessors[sourceFile] = ['coverage'];
    });

    var testsCompleted = 0;
    var testResults: TestResult[] = [];

    var testsToRun = this._generateTestFiles(testFiles);

    _.forEach(testsToRun, (testFile, index) => {
      var config = _.cloneDeep(this.karmaConfig);
      config.coverageReporter = {
        type: 'json',
        dir: dirname,
        subdir: subdir + index
      };

      var coverageFilename = dirname + path.sep + subdir + index + path.sep + 'coverage-final.json';
      this.queueTest(config, sourceFiles, [testFile], (result) => {
        result.setCoverageLocation(coverageFilename);
        testResults.push(result);
        testsCompleted++;

        if (testsCompleted === testsToRun.length) {
          delete this.karmaConfig.reporters;
          delete this.karmaConfig.coverageReporter;
          delete this.karmaConfig.preprocessors;
          testCompletedCallback(testResults);
        }
      });
    });
  };
}
