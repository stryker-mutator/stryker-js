import path = require('path');

import { testInjector, assertions } from '@stryker-mutator/test-helpers';
import { File } from '@stryker-mutator/api/core';

import { FileHeaderPreprocessor } from '../../../src/sandbox/file-header-preprocessor';

const EXPECTED_DEFAULT_HEADER = '// @ts-nocheck\n';

describe(FileHeaderPreprocessor.name, () => {
  let sut: FileHeaderPreprocessor;
  beforeEach(() => {
    sut = testInjector.injector.injectClass(FileHeaderPreprocessor);
  });

  it('should update ts or tsx file by default', async () => {
    const inputContent = 'foo.bar()';
    const expectedOutputContent = `${EXPECTED_DEFAULT_HEADER}foo.bar()`;
    const input = [
      new File('src/app.ts', inputContent),
      new File('test/app-test.ts', inputContent),
      new File('src/components/app.tsx', inputContent),
    ];
    const output = await sut.preprocess(input);

    assertions.expectTextFilesEqual(output, [
      new File('src/app.ts', expectedOutputContent),
      new File('test/app-test.ts', expectedOutputContent),
      new File('src/components/app.tsx', expectedOutputContent),
    ]);
  });

  it('should also match a full file name', async () => {
    // Arrange
    const input = [new File(path.resolve('src', 'app.ts'), 'foo.bar()')];
    testInjector.options.sandbox.fileHeaders = {
      ['+(src|test)/**/*+(.js|.ts)?(x)']: '// @ts-nocheck\n',
    };

    // Act
    const output = await sut.preprocess(input);

    // Assert
    assertions.expectTextFilesEqual(output, [new File(path.resolve('src', 'app.ts'), '// @ts-nocheck\nfoo.bar()')]);
  });

  it('should not change unmatched files according to glob expression', async () => {
    // Arrange
    const input = [
      new File(path.resolve('src', 'app.ts'), 'foo.bar()'),
      new File(path.resolve('testResources', 'app.ts'), '// test file example that should be ignored'),
    ];
    testInjector.options.sandbox.fileHeaders = {
      ['+(src|test)/**/*+(.js|.ts)?(x)']: '// @ts-nocheck\n',
    };

    // Act
    const output = await sut.preprocess(input);

    // Assert
    assertions.expectTextFilesEqual(output, [
      new File(path.resolve('src', 'app.ts'), '// @ts-nocheck\nfoo.bar()'),
      new File(path.resolve('testResources', 'app.ts'), '// test file example that should be ignored'),
    ]);
  });

  it('should allow multiple headers', async () => {
    // Arrange
    const input = [new File('src/app.ts', 'foo.bar()'), new File('src/components/app.component.js', 'baz.qux()')];
    testInjector.options.sandbox.fileHeaders = {
      ['**/*.ts']: '// @ts-nocheck\n',
      ['**/*.js']: '/* eslint-disable */\n',
    };

    // Act
    const output = await sut.preprocess(input);

    // Assert
    assertions.expectTextFilesEqual(output, [
      new File('src/app.ts', '// @ts-nocheck\nfoo.bar()'),
      new File('src/components/app.component.js', '/* eslint-disable */\nbaz.qux()'),
    ]);
  });

  it('should pass-through any other files', async () => {
    const input = [new File('README.md', '# Foo')];
    const output = await sut.preprocess(input);
    assertions.expectTextFilesEqual(output, [new File('README.md', '# Foo')]);
  });
});
