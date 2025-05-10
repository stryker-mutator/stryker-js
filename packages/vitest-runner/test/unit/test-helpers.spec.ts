import { normalizeFileName } from '@stryker-mutator/util';
import { expect } from 'chai';
import path from 'path';
import { toRawTestId } from '../../src/test-helpers.js';
import { createVitestTest, createVitestFile } from '../util/factories.js';

describe('test-helpers', () => {
  describe(toRawTestId.name, () => {
    it('should return correct testId', () => {
      // Using normalizeFileName here mimics the behavior of vitest on windows: using forward slashes
      const filePath = normalizeFileName(path.resolve('src', 'file.js'));
      const test = createVitestTest({ file: createVitestFile({ filepath: filePath }) });
      const result = toRawTestId(test);
      expect(result).to.be.equal(`${filePath}#suite test1`);
    });
  });
});
