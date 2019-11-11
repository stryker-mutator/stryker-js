import { expect } from 'chai';

import * as fileUtils from '../../../src/utils/fileUtils';

describe('fileUtils', () => {
  describe('glob', () => {
    it('should resolve files', () => expect(fileUtils.glob('testResources/globTestFiles/sample/**/*.js')).to.eventually.have.length(10));

    it('should not resolve to directories', () =>
      expect(fileUtils.glob('testResources/globTestFiles/notResolveDirs/**/*.js')).to.eventually.have.length(1));
  });
});
