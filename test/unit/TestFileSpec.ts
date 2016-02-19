'use strict';

var expect = require('chai').expect;
import FileUtils from '../../src/utils/FileUtils';
import TestFile from '../../src/TestFile';
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
