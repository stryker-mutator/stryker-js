import path from 'path';

import { expect } from 'chai';
import { File } from '@stryker-mutator/util';
import { assertions, testInjector } from '@stryker-mutator/test-helpers';

import { TSConfig, TSConfigPreprocessor } from '../../../src/sandbox/ts-config-preprocessor.js';

describe(TSConfigPreprocessor.name, () => {
  let files: File[];
  let sut: TSConfigPreprocessor;

  beforeEach(() => {
    files = [];
    sut = testInjector.injector.injectClass(TSConfigPreprocessor);
  });

  it('should not do anything if the tsconfig file does not exist', async () => {
    files.push(new File('foo.js', 'console.log("foo");'));
    const output = await sut.preprocess(files);
    expect(output).eq(files);
  });

  it('should ignore missing "extends"', async () => {
    files.push(tsconfigFile('tsconfig.json', { references: [{ path: './tsconfig.src.json' }] }));
    const output = await sut.preprocess(files);
    assertions.expectTextFilesEqual(output, files);
  });

  it('should ignore missing "references"', async () => {
    files.push(tsconfigFile('tsconfig.json', { extends: './tsconfig.settings.json' }));
    const output = await sut.preprocess(files);
    assertions.expectTextFilesEqual(output, files);
  });

  it('should rewrite "extends" if it falls outside of sandbox', async () => {
    files.push(tsconfigFile('tsconfig.json', { extends: '../tsconfig.settings.json' }));
    const output = await sut.preprocess(files);
    assertions.expectTextFilesEqual(output, [tsconfigFile('tsconfig.json', { extends: '../../../tsconfig.settings.json' })]);
  });

  it('should not do anything when inPlace = true', async () => {
    testInjector.options.inPlace = true;
    files.push(tsconfigFile('tsconfig.json', { extends: '../tsconfig.settings.json' }));
    const output = await sut.preprocess(files);
    assertions.expectTextFilesEqual(output, files);
  });

  it('should support comments and other settings', async () => {
    files.push(
      new File(
        path.resolve(process.cwd(), 'tsconfig.json'),
        `{
       "extends": "../tsconfig.settings.json",
       "compilerOptions": {
         // Here are the options
         "target": "es5", // and a trailing comma
       }
      }`
      )
    );
    const output = await sut.preprocess(files);
    assertions.expectTextFilesEqual(output, [
      tsconfigFile('tsconfig.json', { extends: '../../../tsconfig.settings.json', compilerOptions: { target: 'es5' } }),
    ]);
  });

  it('should rewrite "references" if it falls outside of sandbox', async () => {
    files.push(tsconfigFile('tsconfig.json', { references: [{ path: '../model' }] }));
    const output = await sut.preprocess(files);
    assertions.expectTextFilesEqual(output, [tsconfigFile('tsconfig.json', { references: [{ path: '../../../model/tsconfig.json' }] })]);
  });

  it('should rewrite referenced tsconfig files that are also located in the sandbox', async () => {
    files.push(tsconfigFile('tsconfig.json', { extends: './tsconfig.settings.json', references: [{ path: './src' }] }));
    files.push(tsconfigFile('tsconfig.settings.json', { extends: '../../tsconfig.root-settings.json' }));
    files.push(tsconfigFile('src/tsconfig.json', { references: [{ path: '../../model' }] }));
    const output = await sut.preprocess(files);
    assertions.expectTextFilesEqual(output, [
      tsconfigFile('tsconfig.json', { extends: './tsconfig.settings.json', references: [{ path: './src' }] }),
      tsconfigFile('tsconfig.settings.json', { extends: '../../../../tsconfig.root-settings.json' }),
      tsconfigFile('src/tsconfig.json', { references: [{ path: '../../../../model/tsconfig.json' }] }),
    ]);
  });

  it('should rewrite "include" array items located outside of the sandbox', async () => {
    // See https://github.com/stryker-mutator/stryker-js/issues/3281
    files.push(
      tsconfigFile('tsconfig.json', {
        include: ['./**/*', '../../../node_modules/self-service-server/lib/main/shared/@types/**/*.d.ts'],
      })
    );
    const output = await sut.preprocess(files);
    assertions.expectTextFilesEqual(output, [
      tsconfigFile('tsconfig.json', {
        include: ['./**/*', '../../../../../node_modules/self-service-server/lib/main/shared/@types/**/*.d.ts'],
      }),
    ]);
  });

  it('should rewrite "exclude" array items located outside of the sandbox', async () => {
    files.push(
      tsconfigFile('tsconfig.json', {
        exclude: ['./**/*', '../foo.ts'],
      })
    );
    const output = await sut.preprocess(files);
    assertions.expectTextFilesEqual(output, [
      tsconfigFile('tsconfig.json', {
        exclude: ['./**/*', '../../../foo.ts'],
      }),
    ]);
  });

  it('should rewrite "files" array items located outside of the sandbox', async () => {
    // See https://github.com/stryker-mutator/stryker-js/issues/3281
    files.push(
      tsconfigFile('tsconfig.json', {
        files: ['foo/bar.ts', '../global.d.ts'],
      })
    );
    const output = await sut.preprocess(files);
    assertions.expectTextFilesEqual(output, [
      tsconfigFile('tsconfig.json', {
        files: ['foo/bar.ts', '../../../global.d.ts'],
      }),
    ]);
  });

  it('should be able to rewrite a monorepo style project', async () => {
    // Arrange
    files.push(
      tsconfigFile('tsconfig.root.json', {
        extends: '../../tsconfig.settings.json',
        references: [{ path: 'src' }, { path: 'test/tsconfig.test.json' }],
      })
    );
    files.push(tsconfigFile('src/tsconfig.json', { extends: '../../../tsconfig.settings.json', references: [{ path: '../../model' }] }));
    files.push(tsconfigFile('test/tsconfig.test.json', { extends: '../tsconfig.root.json', references: [{ path: '../src' }] }));
    testInjector.options.tsconfigFile = 'tsconfig.root.json';

    // Act
    const actual = await sut.preprocess(files);

    // Assert
    const expected = [
      tsconfigFile('tsconfig.root.json', {
        extends: '../../../../tsconfig.settings.json',
        references: [{ path: 'src' }, { path: 'test/tsconfig.test.json' }],
      }),
      tsconfigFile('src/tsconfig.json', {
        extends: '../../../../../tsconfig.settings.json',
        references: [{ path: '../../../../model/tsconfig.json' }],
      }),
      tsconfigFile('test/tsconfig.test.json', { extends: '../tsconfig.root.json', references: [{ path: '../src' }] }),
    ];
    expect(actual).deep.eq(expected);
  });

  function tsconfigFile(fileName: string, content: TSConfig) {
    return new File(path.resolve(fileName), JSON.stringify(content, null, 2));
  }
});
