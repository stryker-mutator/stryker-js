import path from 'path';

import { expect } from 'chai';

import { findTestyLookingFiles } from '../../src/tap-helper.js';
import { tapRunnerOptions } from '../helpers/factory.js';

describe('Running in an testy-looking-files project', () => {
  beforeEach(async () => {
    const testPath = path.resolve('testResources', 'testy-looking-files');
    process.chdir(testPath);
  });

  it('should find all testy looking files', async () => {
    // Act
    const files = await findTestyLookingFiles(tapRunnerOptions().testFiles);

    // Assert
    const expectedFiles = [
      '__tests__/a.js',
      'somefolder/tests/a.js',
      'test/a.js',
      'test/a.cjs',
      'test/a.mjs',
      'test/a.jsx',
      'test/a.ts',
      'test/a.tsx',
      'tests/a.js',
      'a.spec.js',
      'a.test.js',
      'a.tests.js',
      'src/math.spec.js',
    ];

    // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
    expect(files.sort()).deep.equals(expectedFiles.sort());
  });
});
