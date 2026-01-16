import { expect } from 'chai';

import { testFilesProvided } from '../../src/test-files-provided.js';

describe('testFilesProvided', () => {
  it('should return false when testFiles is undefined', () => {
    expect(testFilesProvided({})).to.be.false;
  });

  it('should return false when testFiles is empty', () => {
    expect(testFilesProvided({ testFiles: [] })).to.be.false;
  });

  it('should return true when testFiles is not empty', () => {
    expect(testFilesProvided({ testFiles: ['foo.spec.js'] })).to.be.true;
  });
});
