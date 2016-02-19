'use strict';

var _ = require('lodash');
var program = require('commander');
import FileUtils from './utils/FileUtils';
var Mutator = require('./Mutator');
var ReporterFactory = require('./ReporterFactory');
import TestRunnerFactory from './TestRunnerFactory';
import TypeUtils from './utils/TypeUtils';

/**
 * The Stryker mutation tester.
 * @constructor
 * @param {String[]} sourceFiles - The list of source files which should be mutated.
 * @param {String[]} testFiles - The list of test files.
 * @param {Object} [options] - Optional options.
 * @param {Number} [options].[timeoutMs] - Amount of additional time, in milliseconds, the mutation test is allowed to run.
 * @param {Number} [options].[timeoutFactor] - A factor which is applied to the timeout.
 * @param {Boolean} [options].[individualTests] - Indicates whether the tests in test files should be split up, possibly resulting in faster mutation testing.
 */
function Stryker(sourceFiles, testFiles, options) {
  this._typeUtils = new TypeUtils();
  this._typeUtils.expectParameterArray(sourceFiles, 'Stryker', 'sourceFiles');
  this._typeUtils.expectParameterArray(testFiles, 'Stryker', 'testFiles');
  if (!_.isUndefined(options)) {
    this._typeUtils.expectParameterObject(options, 'Stryker', 'options');
  } else {
    options = {};
  }

  this._fileUtils = new FileUtils();
  this._fileUtils.normalize(sourceFiles);
  this._fileUtils.normalize(testFiles);
  this._fileUtils.createBaseTempFolder();

  var testRunnerConfig = {
    libs: options.libs || [],
    timeoutMs: Number(options.timeoutMs) || 3000,
    timeoutFactor: Number(options.timeoutFactor) || 1.25,
    individualTests: options.individualTests || false
  };

  this._fileUtils.normalize(testRunnerConfig.libs);
  
  var reporterFactory = new ReporterFactory();
  var testRunnerFactory = new TestRunnerFactory();

  this._sourceFiles = sourceFiles;
  this._testFiles = testFiles;
  this._reporter = reporterFactory.getReporter('console');
  this._testRunner = testRunnerFactory.getTestRunner('jasmine', testRunnerConfig);
}

/**
 * Runs mutation testing. This may take a while.
 * @function
 */
Stryker.prototype.runMutationTest = function(cb) {
  var that = this;
  console.log('INFO: Running initial test run');
  this._testRunner.testAndCollectCoverage(this._sourceFiles, this._testFiles, function(testResults) {
    if (that._allTestsSuccessful(testResults)) {
      console.log('INFO: Initial test run succeeded');
      var mutator = new Mutator();
      var mutants = mutator.mutate(that._sourceFiles);
      console.log('INFO: ' + mutants.length + ' Mutants generated');

      var testFilesToRemove = [];
      _.forEach(testResults, function(testResult) {
        testFilesToRemove = testFilesToRemove.concat(testResult.getTestFiles());
      });

      that._testRunner.testMutants(mutants, that._sourceFiles, testResults,
        function(mutant) {
          // Call the reporter like this instead of passing the function directly to ensure that `this` in the reporter is still the reporter.
          that._reporter.mutantTested(mutant);
        },
        function(mutants) {
          that._reporter.allMutantsTested(mutants);

          _.forEach(testFilesToRemove, function(testFile) {
            testFile.remove();
          });
          that._fileUtils.removeBaseTempFolder();

          if (cb) {
            cb();
          }
        });
    } else {
      console.log('ERROR: One or more tests failed in the inial test run!');
    }
  });
};

/**
 * Looks through a list of TestResults to see if all tests have passed.
 * @function
 * @param {TestResult[]} testResults - The list of TestResults.
 * @returns {Boolean} True if all tests passed.
 */
Stryker.prototype._allTestsSuccessful = function(testResults) {
  this._typeUtils.expectParameterArray(testResults, 'Stryker', 'testResults');
  var unsuccessfulTest = _.find(testResults, function(result) {
    return !result.getAllTestsSuccessful();
  });
  return _.isUndefined(unsuccessfulTest);
};

(function run() {
  function list(val) {
    return val.split(',');
  }
  program
    .usage('-s <items> -t <items> [other options]')
    .option('-s, --src <items>', 'A list of source files. Example: a.js,b.js', list)
    .option('-t, --tests <items>', 'A list of test files. Example: a.js,b.js', list)
    .option('-l, --libs [<items>]', 'A list of library files. Example: a.js,b.js', list)
    .option('-m, --timeout-ms [amount]', 'Amount of additional time, in milliseconds, the mutation test is allowed to run')
    .option('-f, --timeout-factor [amount]', 'The factor is applied on top of the other timeouts when during mutation testing')
    .option('-i, --individual-tests', 'Runs each test separately instead of entire test files')
    .parse(process.argv);

  if (program.src && program.tests) {
    var options = {
      libs: program.libs,
      timeoutMs: program.timeoutMs,
      timeoutFactor: program.timeoutFactor,
      individualTests: program.individualTests
    };

    var stryker = new Stryker(program.src, program.tests, options);
    stryker.runMutationTest();
  }
})();

module.exports = Stryker;
