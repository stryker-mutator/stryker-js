import path from 'path';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { FilePreprocessor, createPreprocessor } from '../../../src/sandbox/index.js';
import { FileSystemTestDouble } from '../../helpers/file-system-test-double.js';
import { serializeTSConfig } from '../../helpers/producers.js';
import { Project } from '../../../src/fs/index.js';

describe(createPreprocessor.name, () => {
  let fsTestDouble: FileSystemTestDouble;
  let sut: FilePreprocessor;

  beforeEach(() => {
    fsTestDouble = new FileSystemTestDouble();
    sut = testInjector.injector.injectFunction(createPreprocessor);
  });

  it('should rewrite tsconfig files', async () => {
    // Arrange
    const tsconfigFileName = path.resolve('tsconfig.json');
    const tsconfigInput = serializeTSConfig({ extends: '../tsconfig.settings.json' });
    fsTestDouble.files[tsconfigFileName] = tsconfigInput;
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());

    // Act
    await sut.preprocess(project);

    // Assert
    expect(await project.files.get(tsconfigFileName)!.readContent()).eq(serializeTSConfig({ extends: '../../../tsconfig.settings.json' }));
  });

  it('should disable type checking for .ts files', async () => {
    const fileName = path.resolve('src/app.ts');
    fsTestDouble.files[fileName] = 'foo.bar()';
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());
    await sut.preprocess(project);
    expect(await project.files.get(fileName)!.readContent()).eq('// @ts-nocheck\nfoo.bar()');
  });

  it('should strip // @ts-expect-error (see https://github.com/stryker-mutator/stryker-js/issues/2364)', async () => {
    const fileName = path.resolve('src/app.ts');
    fsTestDouble.files[fileName] = '// @ts-expect-error\nfoo.bar()';
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());
    await sut.preprocess(project);
    expect(await project.files.get(fileName)!.readContent()).eq('// @ts-nocheck\n// \nfoo.bar()');
  });
});
