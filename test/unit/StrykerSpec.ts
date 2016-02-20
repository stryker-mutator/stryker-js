'use strict';

var expect = require('chai').expect;
import BaseTestRunner from '../../src/testrunners/BaseTestRunner';
import FileUtils from '../../src/utils/FileUtils';
import Stryker from '../../src/Stryker';
import TestRunnerFactory from '../../src/TestRunnerFactory';
require('mocha-sinon');

describe("Stryker", function() {
  class MockTestRunner extends BaseTestRunner {
    sourceFiles: string[];
    testFiles: string[];
  }

  it("should do an initial test run", function() {
    this.sinon.stub(FileUtils.prototype, 'createDirectory');
    var mockRunner = new MockTestRunner({});
    mockRunner.sourceFiles = [];
    mockRunner.testFiles = [];
    mockRunner.testAndCollectCoverage = function(sourceFiles, testFiles) {
      this.sourceFiles = sourceFiles;
      this.testFiles = testFiles;
    };

    var sourceFiles = ['hello.js'];
    var testFiles = ['helloSpec.js'];
    var stryker = new Stryker(sourceFiles, testFiles);
    stryker._testRunner = mockRunner;

    stryker.runMutationTest(function() { });

    expect(mockRunner.sourceFiles).to.equal(sourceFiles);
    expect(mockRunner.testFiles).to.equal(testFiles);
  });
});
