'use strict';

var _ = require('lodash');
var expect = require('chai').expect;
import KarmaTestRunner from '../../../src/testrunners/KarmaTestRunner';
import TestFile from '../../../src/TestFile';
import TestResult from '../../../src/TestResult';
require('mocha-sinon');

describe('KarmaTestRunner', function() {
  var testRunner;

  beforeEach(function() {
    var config = {};
    testRunner = new KarmaTestRunner(config);
    testRunner.setBaseTimeout(0);
    testRunner.setTimeoutMs(0);
    testRunner.setTimeoutFactor(1.0);
  });

  it('should generate unique names for code coverage folders', function(done) {
    this.timeout(10000);
    this.sinon.stub(KarmaTestRunner.prototype, 'test', function(config, sourceFiles, testFiles, testCompletedCallback) {
      setTimeout(function() {
        testCompletedCallback(new TestResult(sourceFiles, testFiles, 0, 0, false, false, 0));
      }, 100);
    });
    this.sinon.stub(KarmaTestRunner.prototype, '_splitTest', function(testFile) {
      return new TestFile(testFile, testFile);
    });
    this.sinon.stub(TestFile.prototype, 'save', function() {
        return 'tmp/some/file.js';
    });

    var sourceFiles = ['a.js', 'b.js', 'c.js', 'd.js', 'e.js', 'f.js', 'g.js', 'h.js', 'i.js', 'j.js', 'k.js', 'l.js', 'm.js', ];
    var testFiles = ['aSpec.js', 'bSpec.js', 'cSpec.js', 'dSpec.js', 'eSpec.js', 'eSpec.js', 'fSpec.js', 'gSpec.js', 'hSpec.js', 'iSpec.js', 'jSpec.js', 'kSpec.js', 'lSpec.js', 'mSpec.js'];

    testRunner.testAndCollectCoverage(sourceFiles, testFiles, function(testResults) {
      var uniqueResults = _.uniq(testResults, '_coverageLocation');
      _.forEach(testResults, function(testResult) {
        console.log(testResult.getCoverageLocation());
      });

      expect(uniqueResults.length).to.equal(testResults.length);
      done();
    });
  });
});
