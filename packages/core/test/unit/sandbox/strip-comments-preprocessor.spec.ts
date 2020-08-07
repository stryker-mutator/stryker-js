import path = require('path');

import { testInjector, assertions } from '@stryker-mutator/test-helpers';
import { File } from '@stryker-mutator/api/core';

import { StripCommentsPreprocessor } from '../../../src/sandbox/strip-comments-preprocessor';

describe(StripCommentsPreprocessor.name, () => {
  let sut: StripCommentsPreprocessor;

  beforeEach(() => {
    sut = testInjector.injector.injectClass(StripCommentsPreprocessor);
  });

  it('should strip comments', async () => {
    const input = [new File(path.resolve('src/app.ts'), '// @ts-expect-error\nfoo.bar();')];
    const output = await sut.preprocess(input);
    assertions.expectTextFilesEqual(output, [new File(path.resolve('src/app.ts'), '\nfoo.bar();')]);
  });

  it('should not strip strings with comments in it', async () => {
    const input = [new File(path.resolve('src/app.ts'), 'foo.bar("// @ts-expect-error");')];
    const output = await sut.preprocess(input);
    assertions.expectTextFilesEqual(output, [new File(path.resolve('src/app.ts'), 'foo.bar("// @ts-expect-error");')]);
  });

  it('should only strip comments in that match the "sandboxStripComments" glob expression', async () => {
    const input = [
      new File(path.resolve('src/app.ts'), '// @ts-expect-error\nfoo.bar();'),
      new File(path.resolve('test/app.spec.ts'), '/* @ts-expect-error */\nfoo.bar();'),
      new File(path.resolve('testResources/project/app.ts'), '/* @ts-expect-error */\nfoo.bar();'),
    ];
    testInjector.options.sandboxStripComments = '+(src|test)/**/*.ts';
    const output = await sut.preprocess(input);
    assertions.expectTextFilesEqual(output, [
      new File(path.resolve('src/app.ts'), '\nfoo.bar();'),
      new File(path.resolve('test/app.spec.ts'), 'foo.bar();'),
      new File(path.resolve('testResources/project/app.ts'), '/* @ts-expect-error */\nfoo.bar();'),
    ]);
  });
});
