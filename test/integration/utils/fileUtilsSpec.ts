'use strict';

const expect = require('chai').expect;
const fs = require('fs');
import * as fileUtils from '../../../src/utils/fileUtils';
require('mocha-sinon');

describe('fileUtils', function() {

  describe('should be able to read a file', function() {
    it('synchronously', function() {
      const msg = 'hello 1 2';
      this.sinon.stub(fs, 'readFileSync', function(filename: string, encoding: string) {
        return msg;
      });

      const data = fileUtils.readFile('hello.js');

      expect(data).to.equal(msg);
    });
  });

  it('should indicate that an existing file exists', function() {
    const exists = fileUtils.fileOrFolderExistsSync('src/Stryker.ts');

    expect(exists).to.equal(true);
  });

  it('should indicate that an non-existing file does not exists', function() {
    const exists = fileUtils.fileOrFolderExistsSync('src/Strykerfaefeafe.js');

    expect(exists).to.equal(false);
  });

});
