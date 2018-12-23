import { expect } from 'chai';
import { Config } from '../../../config';
import * as minimatch from 'minimatch';

describe('Config', () => {

  let sut: Config;
  const defaultThresholds = Object.freeze({ high: 80, low: 60, break: null });

  beforeEach(() => sut = new Config());

  describe('defaults', () => {
    it('should set default thresholds as expected', () => {
      expect(sut.thresholds).deep.eq(defaultThresholds);
    });
  });

  describe('set', () => {

    it('should override values', () => {
      const expectedFiles = ['a file'];
      sut.set({ files: expectedFiles });
      expect(sut.files).eq(expectedFiles);
    });

    it('should override thresholds when assigned', () => {
      sut.set({ thresholds: {} });
      expect(sut.thresholds).deep.eq({});
    });

    it('should never clear thresholds', () => {
      sut.set({ thresholds: undefined });
      expect(sut.thresholds).not.be.undefined;
    });
  });

  describe('default value for `mutate` property', () => {

    let defaultMutatePatterns: string[];

    beforeEach(() => {
      defaultMutatePatterns = new Config().mutate;
    });

    it('should not match test files', () => {
      actAssertNoMatch('test/bar.js');
      actAssertNoMatch('src/__tests__/foo.js');
      actAssertNoMatch('src/foo/__tests__/foo.js');
      actAssertNoMatch('src/fooSpec.js');
      actAssertNoMatch('src/foo.spec.js');
      actAssertNoMatch('src/bar/fooSpec.js');
      actAssertNoMatch('src/bar/foo.spec.js');
    });

    it('should match production files', () => {
      actAssertMatches('src/index.js');
      actAssertMatches('src/foo/bar/index.js');
      actAssertMatches('src/foo/bar/supertest.js');
    });

    function actAssertNoMatch(testFileName: string) {
      expect(matches(testFileName), `${testFileName} would be mutated, while it shouldn't.`).be.false;
    }

    function actAssertMatches(productionFileName: string) {
      expect(matches(productionFileName), `${productionFileName} would be mutated, while it shouldn't.`).be.true;
    }

    function matches(fileName: string) {
      let isMatch = false;
      for (const pattern of defaultMutatePatterns) {
        if (pattern.startsWith('!')) {
          if (minimatch(fileName, pattern.substr(1))) {
            isMatch = false;
          }
        } else {
          if (minimatch(fileName, pattern)) {
            isMatch = true;
          }
        }
      }
      return isMatch;
    }
  });
});
