'use strict';

var expect = require('chai').expect;
var FileUtils = require('../../src/utils/FileUtils');
var TestFile = require('../../src/TestFile');
require('mocha-sinon');

describe('TestFile', function() {
  var testFile;
  var pathToTest;
  var testName;
  var content;
  var fileUtilsData;
  var fileUtilsPath;

  beforeEach(function() {
    this.sinon.stub(FileUtils.prototype, 'createFileInTempFolder', function(filePath, data) {
      fileUtilsData = data;
      fileUtilsPath = 'tmp/' + filePath;
      return fileUtilsPath;
    });

    testName = 'Test should pass if all parameters are provided';
    content = 'console.log("Hello world!");';
    testFile = new TestFile(testName, content);
  });

  describe('should throw an error', function() {
    it('if the parameter name is not provided', function() {
      expect(function() {
        new TestFile();
      }).to.throw(Error);
    });

    it('if the parameter content is not a String', function() {
      expect(function() {
        new TestFile('path.js', [1, 2]);
      }).to.throw(Error);
    });
  });

  describe('should set', function() {
    it('the path', function() {
      expect(testFile.getPath()).to.equal(fileUtilsPath);
    });

    it('the name of the test', function() {
      expect(testFile.getName()).to.equal(testName);
    });
  });

  describe('should save the TestFile', function() {
    it('with the correct content', function() {
      expect(fileUtilsData).to.equal(content);
    });
  });
});
