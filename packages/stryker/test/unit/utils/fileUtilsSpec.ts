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

  describe('isOnlineFile', () => {
    describe('returns true', () => {
      it('when provided with http://google.com', () => {
        let url = 'http://google.com';

        let result = fileUtils.isOnlineFile(url);

        expect(result).to.be.true;
      });

      it('when provided with https://google.com', () => {
        let url = 'https://google.com';

        let result = fileUtils.isOnlineFile(url);

        expect(result).to.be.true;
      });
    });

    describe('returns false', () => {
      it('when provided with http:/google.com', () => {
        let url = 'http:/google.com';

        let result = fileUtils.isOnlineFile(url);

        expect(result).to.be.false;
      });

      it('when provided with google.com', () => {
        let url = 'google.com';

        let result = fileUtils.isOnlineFile(url);

        expect(result).to.be.false;
      });
    });
  });
});