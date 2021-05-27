import { expect } from 'chai';

import { FileMatcher } from '../../../src/config';

describe(FileMatcher.name, () => {
  describe(FileMatcher.prototype.matches.name, () => {
    it('should match when the glob pattern matches', () => {
      const sut = new FileMatcher('src/**/*.ts');
      expect(sut.matches('src/foo.ts')).true;
    });

    it('should not match if the pattern is set to `false`', () => {
      const sut = new FileMatcher(false);
      expect(sut.matches('src/foo.js')).false;
    });

    it("should not match if the glob pattern doesn't match", () => {
      const sut = new FileMatcher('src/**/*.js');
      expect(sut.matches('test/foo.spec.js')).false;
    });

    // more tests would test the internals of minimatch itself. We expect that to work.
  });
});
