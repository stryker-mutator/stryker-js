'use strict';

var _ = require('lodash');
var fork = require('child_process').fork;
var path = require('path');
var Server = require('karma').Server;
import BaseTestRunner from './BaseTestRunner';
import FileUtils from '../utils/FileUtils';
import TestFile from '../TestFile';
import TestResult from '../TestResult';

export default class KarmaTestRunner extends BaseTestRunner {
  
  protected _fileUtils = new FileUtils();
 

  test(config, sourceFiles: string[], testFiles: TestFile[], testCompletedCallback) {
    super.test(config, sourceFiles, testFiles, testCompletedCallback);

    if (testFiles.length > 0) {
      config.files = sourceFiles.concat(config.libs, testFiles.map( file => file.getPath()));

      config.browserNoActivityTimeout = this.getTotalTimeout();

      var serverProcess = fork(__dirname + '/KarmaServerWorker.js', {
        silent: true
      });

      serverProcess.on('message', function(result) {
        var testResult = new TestResult(sourceFiles, testFiles, result.success, result.failed, result.disconnected, result.error, result.timeSpent);
        testCompletedCallback(testResult);
      });
      serverProcess.stdout.on('data', function(data) {
        // Do nothing. Workaround which prevents Stryker from getting stuck while testing mutants on several devices.
        // This problem does not occur when the childprocess is run using the option `silent: false` or if the stdout is redirected as this function is doing.
      });

      serverProcess.send(config);

    } else {
      var testResult = new TestResult(sourceFiles, testFiles, 0, 0, false, false, 0);
      testCompletedCallback(testResult);
    }
  };

  testAndCollectCoverage(sourceFiles: string[], testFiles: string[], testCompletedCallback) {
    super.testAndCollectCoverage(sourceFiles, testFiles, testCompletedCallback);
    var dirname = this._fileUtils.getBaseTempFolder();
    var subdir = 'coverage';

    this._config.reporters = ['coverage'];
    this._config.preprocessors = {};
    _.forEach(sourceFiles, (sourceFile) => {
      this._config.preprocessors[sourceFile] = ['coverage'];
    });

    var testsCompleted = 0;
    var testResults = [];

    var testsToRun = this._generateTestFiles(testFiles);

    _.forEach(testsToRun, (testFile, index) => {
      var config = _.cloneDeep(this._config);
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
          delete this._config.reporters;
          delete this._config.coverageReporter;
          delete this._config.preprocessors;
          testCompletedCallback(testResults);
        }
      });
    });
  };
}
