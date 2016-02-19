'use strict';

var expect = require('chai').expect;
var fs = require('fs');
import FileUtils from '../../../src/utils/FileUtils';
require('mocha-sinon');

describe('FileUtils', function() {
  var fileUtils;

  beforeEach(function() {
    fileUtils = new FileUtils();
  });

  it('should generate different file names if they are made at the same time', function() {
    var baseFolderName = 'stryker';
    var filePath = '/src/hello.js';
    var data = 'var i = 5;';
    this.sinon.stub(FileUtils.prototype, 'createDirectory');
    this.sinon.stub(FileUtils.prototype, 'createFile');
    this.sinon.stub(Date, 'now', function() {
      return 1447849085;
    });

    var file1 = fileUtils.createFileInTempFolder(baseFolderName, filePath, data);
    var file2 = fileUtils.createFileInTempFolder(baseFolderName, filePath, data);

    expect(file1).to.not.equal(file2);
  });

  describe('should be able to read a file', function() {
    it('synchronously', function() {
      var msg = 'hello 1 2';
      this.sinon.stub(fs, 'readFileSync', function(filename, encoding) {
        return msg;
      });

      var data = fileUtils.readFile('hello.js');

      expect(data).to.equal(msg);
    });
  });

  it('should indicate that an existing file exists', function() {
    var exists = fileUtils.fileOrFolderExists('src/Stryker.ts');

    expect(exists).to.equal(true);
  });

  it('should indicate that an non-existing file does not exists', function() {
    var exists = fileUtils.fileOrFolderExists('src/Strykerfaefeafe.js');

    expect(exists).to.equal(false);
  });

});
