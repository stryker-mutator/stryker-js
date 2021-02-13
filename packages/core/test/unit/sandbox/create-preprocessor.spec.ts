import path from 'path';

import { File } from '@stryker-mutator/api/core';
import { assertions, testInjector } from '@stryker-mutator/test-helpers';

import { createPreprocessor, FilePreprocessor } from '../../../src/sandbox';

describe(createPreprocessor.name, () => {
  let sut: FilePreprocessor;

  beforeEach(() => {
    sut = testInjector.injector.injectFunction(createPreprocessor);
  });

  it('should rewrite tsconfig files', async () => {
    const output = await sut.preprocess([new File(path.resolve('tsconfig.json'), '{"extends": "../tsconfig.settings.json" }')]);
    assertions.expectTextFilesEqual(output, [new File(path.resolve('tsconfig.json'), '{\n  "extends": "../../../tsconfig.settings.json"\n}')]);
  });

  it('should disable type checking for .ts files', async () => {
    const output = await sut.preprocess([new File(path.resolve('src/app.ts'), 'foo.bar()')]);
    assertions.expectTextFilesEqual(output, [new File(path.resolve('src/app.ts'), '// @ts-nocheck\nfoo.bar()')]);
  });

  it('should strip // @ts-expect-error (see https://github.com/stryker-mutator/stryker/issues/2364)', async () => {
    const output = await sut.preprocess([new File(path.resolve('src/app.ts'), '// @ts-expect-error\nfoo.bar()')]);
    assertions.expectTextFilesEqual(output, [new File(path.resolve('src/app.ts'), '// @ts-nocheck\n// \nfoo.bar()')]);
  });
});
