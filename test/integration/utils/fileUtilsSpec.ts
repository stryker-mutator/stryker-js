'use strict';

var expect = require('chai').expect;
var fs = require('fs');
import * as fileUtils from '../../../src/utils/fileUtils';
require('mocha-sinon');

describe('fileUtils', function() {

  describe('should be able to read a file', function() {
    it('synchronously', function() {
      var msg = 'hello 1 2';
      this.sinon.stub(fs, 'readFileSync', function(filename: string, encoding: string) {
        return msg;
      });

      var data = fileUtils.readFile('hello.js');

      expect(data).to.equal(msg);
    });
  });

  it('should indicate that an existing file exists', function() {
    var exists = fileUtils.fileOrFolderExistsSync('src/Stryker.ts');

    expect(exists).to.equal(true);
  });

  it('should indicate that an non-existing file does not exists', function() {
    var exists = fileUtils.fileOrFolderExistsSync('src/Strykerfaefeafe.js');

    expect(exists).to.equal(false);
  });

});
