import { expect } from 'chai';
import * as fileUtils from '../../../src/utils/fileUtils';
import * as fs from 'mz/fs';

describe('fileUtils', () => {

  beforeEach(() => {
    sandbox.stub(fs, 'writeFile');
  });

  describe('writeFile', () => {
    it('should call fs.writeFile', () => {
      fileUtils.writeFile('filename', 'data');
      expect(fs.writeFile).to.have.been.calledWith('filename', 'data', 'utf8');
    });
  });
});