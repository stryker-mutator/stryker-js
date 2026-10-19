import { normalizeFileName } from '@stryker-mutator/util';
import { expect } from 'chai';
import path from 'path';
import { collectTestName, toRawTestId } from '../../src/test-helpers.js';
import { createVitestTest, createVitestFile } from '../util/factories.js';

describe('test-helpers', () => {
  describe(collectTestName.name, () => {
    it('should retain legacy names even when a native full name exists', () => {
      const test = createVitestTest({ fullTestName: 'suite > test1' });
      expect(collectTestName(test, false)).eq('suite test1');
    });

    it('should preserve the native full name verbatim for Vitest 5', () => {
      const fullTestName = ' suite > [nested] # > test .*? ';
      const test = createVitestTest({ fullTestName });
      expect(collectTestName(test, true)).eq(fullTestName);
    });

    it('should preserve an empty native test name', () => {
      const test = createVitestTest({ fullTestName: '' });
      expect(collectTestName(test, true)).eq('');
    });
  });

  describe(toRawTestId.name, () => {
    it('should return correct testId', () => {
      // Using normalizeFileName here mimics the behavior of vitest on windows: using forward slashes
      const filePath = normalizeFileName(path.resolve('src', 'file.js'));
      const test = createVitestTest({
        file: createVitestFile({ filepath: filePath }),
      });
      const result = toRawTestId(test);
      expect(result).to.be.equal(`${filePath}#suite test1`);
    });

    it('should use "unknown.js" as fallback when test has no file', () => {
      const test = createVitestTest();
      (test as any).file = undefined;
      const result = toRawTestId(test);
      expect(result).to.be.equal('unknown.js#suite test1');
    });

    it('should use the native full name in Vitest 5 test IDs', () => {
      const fullTestName = 'suite > test #1';
      const test = createVitestTest({ fullTestName });
      expect(toRawTestId(test, true)).eq(`file.spec.js#${fullTestName}`);
    });
  });
});
