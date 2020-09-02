import path = require('path');

import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { coreTokens } from '../../../src/di';
import InputFileResolver from '../../../src/input/InputFileResolver';

const resolveTestResource: typeof path.resolve = path.resolve.bind(
  path,
  __dirname,
  '..' /* input */,
  '..' /* integration */,
  '..' /* test */,
  'testResources',
  'input-files'
);

describe(`${InputFileResolver.name} integration`, () => {
  let sut: InputFileResolver;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    sut = testInjector.injector.provideValue(coreTokens.reporter, factory.reporter()).injectClass(InputFileResolver);
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it.only('should by default resolve reasonable project source files to be mutated', async () => {
    process.chdir(resolveTestResource());
    const inputFiles = await sut.resolve();
    expect(inputFiles.filesToMutate.map((file) => file.name)).deep.eq([
      resolveTestResource('lib', 'string-utils.js'),
      resolveTestResource('src', 'app.ts'),
      resolveTestResource('src', 'components', 'calculator', 'calculator.component.tsx'),
      resolveTestResource('src', 'components', 'heading', 'heading.component.vue'),
      resolveTestResource('src', 'index.html'),
      resolveTestResource('src', 'services', 'storage.ts'),
      resolveTestResource('src', 'services', 'test.ts'),
      resolveTestResource('src', 'utils', 'commonjs.cjs'),
      resolveTestResource('src', 'utils', 'esm.mjs'),
    ]);
  });
});
