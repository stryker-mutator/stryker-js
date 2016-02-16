'use strict';

var expect = require('chai').expect;
var BaseTestRunner = require('../../src/testrunners/BaseTestRunner');
var FileUtils = require('../../src/utils/FileUtils');
var Stryker = require('../../src/Stryker');
var TestRunnerFactory = require('../../src/TestRunnerFactory');
require('mocha-sinon');

describe("Stryker", function() {
  it("should throw an error when no source files are provided", function() {
    expect(function() {
      new Stryker();
    }).to.throw(Error);
  });

  it("should throw an error when no test files are provided", function() {
    expect(function() {
      new Stryker(['mySourceFile.js']);
    }).to.throw(Error);
  });

  it("should do an initial test run", function() {
    this.sinon.stub(FileUtils.prototype, 'createDirectory');
    var mockRunner = new BaseTestRunner({});
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

    stryker.runMutationTest();

    expect(mockRunner.sourceFiles).to.equal(sourceFiles);
    expect(mockRunner.testFiles).to.equal(testFiles);
  });
});
