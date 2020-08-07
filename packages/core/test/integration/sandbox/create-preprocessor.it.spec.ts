import path = require('path');

import { testInjector, assertions } from '@stryker-mutator/test-helpers';
import { File } from '@stryker-mutator/api/core';

import { FilePreprocessor, createPreprocessor } from '../../../src/sandbox';

describe('File preprocessor integration', () => {
  let sut: FilePreprocessor;

  beforeEach(() => {
    sut = testInjector.injector.injectFunction(createPreprocessor);
  });

  it('should rewrite tsconfig files', async () => {
    const output = await sut.preprocess([new File(path.resolve('tsconfig.json'), '{"extends": "../tsconfig.settings.json" }')]);
    assertions.expectTextFilesEqual(output, [new File(path.resolve('tsconfig.json'), '{\n  "extends": "../../../tsconfig.settings.json"\n}')]);
  });

  it('should add a header to .ts files', async () => {
    const output = await sut.preprocess([new File(path.resolve('app.ts'), 'foo.bar()')]);
    assertions.expectTextFilesEqual(output, [new File(path.resolve('app.ts'), '/* eslint-disable */\n// @ts-nocheck\nfoo.bar()')]);
  });
});
