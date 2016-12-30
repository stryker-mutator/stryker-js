import { expect } from 'chai';
import { isOnlineFile } from '../../../src/utils/fileUtils';

describe('fileUtils', () => {

  describe('isOnlineFile', () => {

    describe('returns true', () => {
      
      it('when provided with http://google.com', () => {
        let url = 'http://google.com';

        let result = isOnlineFile(url);

        expect(result).to.be.true;
      });

      it('when provided with https://google.com', () => {
        let url = 'https://google.com';

        let result = isOnlineFile(url);

        expect(result).to.be.true;
      });

    });

    describe('returns true', () => {
      
      it('when provided with http:/google.com', () => {
        let url = 'http:/google.com';

        let result = isOnlineFile(url);

        expect(result).to.be.false;
      });

      it('when provided with google.com', () => {
        let url = 'google.com';

        let result = isOnlineFile(url);

        expect(result).to.be.false;
      });
      
    });

  });

});
