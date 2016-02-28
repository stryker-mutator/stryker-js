'use strict';

import {expect} from 'chai';
import FileUtils from '../../src/utils/FileUtils';
import TestFile from '../../src/TestFile';
require('mocha-sinon');

describe('TestFile', function() {
  var testFile: TestFile;
  var pathToTest: string;
  var testName: string;
  var content: string;
  var fileUtilsData: string;
  var fileUtilsPath: string;

  beforeEach(function() {
    this.sinon.stub(FileUtils.prototype, 'createFileInTempFolder', function(filePath: string, data: string) {
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
      expect(testFile.path).to.equal(fileUtilsPath);
    });

    it('the name of the test', function() {
      expect(testFile.name).to.equal(testName);
    });
  });

  describe('should save the TestFile', function() {
    it('with the correct content', function() {
      expect(fileUtilsData).to.equal(content);
    });
  });
});
