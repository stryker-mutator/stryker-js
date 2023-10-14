import { expect } from 'chai';

import { FileMatcher } from '../../../src/config/index.js';

describe(FileMatcher.name, () => {
  describe(FileMatcher.prototype.matches.name, () => {
    it('should match when the glob pattern matches', () => {
      const sut = new FileMatcher('src/**/*.ts');
      expect(sut.matches('src/foo.ts')).true;
    });

    ['js', 'ts', 'jsx', 'tsx', 'html', 'vue', 'mjs', 'mts', 'cts', 'cjs'].forEach((ext) => {
      it(`should match when the glob pattern matches with extension ${ext}`, () => {
        const sut = new FileMatcher(true);
        expect(sut.matches(`src/foo.${ext}`)).true;
      });
    });

    it('should allow hidden files to be matched', () => {
      const sut = new FileMatcher(true);
      expect(sut.matches('.hidden/foo.js')).true;
    });

    it('should not match binary files if the pattern is set to `true`', () => {
      const sut = new FileMatcher(true);
      expect(sut.matches('src/foo.docx')).false;
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
