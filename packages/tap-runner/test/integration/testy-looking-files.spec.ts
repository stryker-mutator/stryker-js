import { expect } from 'chai';
import { TempTestDirectorySandbox } from '@stryker-mutator/test-helpers';

import { FindTestyLookingFiles } from '../../src/tap-helper.js';

describe('Running in an testy-looking-files project', () => {
  let sandbox: TempTestDirectorySandbox;

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('testy-looking-files');
    await sandbox.init();
  });
  afterEach(async () => {
    await sandbox.dispose();
  });

  it('should find all testy looking files', async () => {
    // Act
    const files = await FindTestyLookingFiles();

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
    ];

    expect(files).lengthOf(expectedFiles.length);
    expect(files).to.include.members(expectedFiles);
  });
});
