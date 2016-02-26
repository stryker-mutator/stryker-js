'use strict';

import * as _ from 'lodash';
import {expect} from 'chai';
import KarmaTestRunner from '../../../src/testrunners/KarmaTestRunner';
import {TestCompletedCallback} from '../../../src/testrunners/BaseTestRunner';
import TestFile from '../../../src/TestFile';
import TestResult from '../../../src/TestResult';
import TestRunnerConfig from '../../../src/testrunners/TestRunnerConfig';

require('mocha-sinon');

describe('KarmaTestRunner', function() {
  var testRunner: KarmaTestRunner;

  beforeEach(function() {
    var config = {};
    testRunner = new KarmaTestRunner(config);
    testRunner.setBaseTimeout(0);
    testRunner.setTimeoutMs(0);
    testRunner.setTimeoutFactor(1.0);
  });

  it('should generate unique names for code coverage folders', function(done) {
    this.timeout(10000);
    this.sinon.stub(KarmaTestRunner.prototype, 'test', (config: TestRunnerConfig, sourceFiles: string[], testFiles: TestFile[], testCompletedCallback: TestCompletedCallback) => {
      setTimeout(() => {
        testCompletedCallback(new TestResult(sourceFiles, testFiles, 0, 0, false, false, 0));
      }, 100);
    });
    this.sinon.stub(KarmaTestRunner.prototype, '_splitTest', (testFile: string) => {
      return new TestFile(testFile, testFile);
    });
    this.sinon.stub(TestFile.prototype, 'save', () => {
      return 'tmp/some/file.js';
    });

    var sourceFiles = ['a.js', 'b.js', 'c.js', 'd.js', 'e.js', 'f.js', 'g.js', 'h.js', 'i.js', 'j.js', 'k.js', 'l.js', 'm.js', ];
    var testFiles = ['aSpec.js', 'bSpec.js', 'cSpec.js', 'dSpec.js', 'eSpec.js', 'eSpec.js', 'fSpec.js', 'gSpec.js', 'hSpec.js', 'iSpec.js', 'jSpec.js', 'kSpec.js', 'lSpec.js', 'mSpec.js'];

    testRunner.testAndCollectCoverage(sourceFiles, testFiles, function(testResults) {
      var uniqueResults = _.uniq(testResults);
      _.forEach(testResults, (testResult) => {
        console.log(testResult.getCoverageLocation());
      });

      expect(uniqueResults.length).to.equal(testResults.length);
      done();
    });
  });
});
