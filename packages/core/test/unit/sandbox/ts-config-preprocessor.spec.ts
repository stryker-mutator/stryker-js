import path from 'path';

import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';

import { TSConfigPreprocessor } from '../../../src/sandbox/ts-config-preprocessor.js';
import { FileSystemTestDouble } from '../../helpers/file-system-test-double.js';
import { Project } from '../../../src/fs/project.js';
import { serializeTSConfig } from '../../helpers/producers.js';

describe(TSConfigPreprocessor.name, () => {
  let fsTestDouble: FileSystemTestDouble;
  let sut: TSConfigPreprocessor;
  const tsconfigFileName = path.resolve('tsconfig.json');

  beforeEach(() => {
    fsTestDouble = new FileSystemTestDouble();
    sut = testInjector.injector.injectClass(TSConfigPreprocessor);
  });

  it('should not do anything if the tsconfig file does not exist', async () => {
    fsTestDouble.files['foo.js'] = 'console.log("foo");';
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());
    await sut.preprocess(project);
    expect(project.files.size).eq(1);
    expect(await project.files.get('foo.js')!.readContent()).eq('console.log("foo");');
  });

  it('should ignore missing "extends"', async () => {
    // Arrange
    const tsconfigInput = serializeTSConfig({ extends: './tsconfig.src.json' });
    fsTestDouble.files[tsconfigFileName] = tsconfigInput;
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());

    // Act
    await sut.preprocess(project);

    // Assert
    expect(await project.files.get(tsconfigFileName)!.readContent()).eq(tsconfigInput);
  });

  it('should ignore missing "references"', async () => {
    // Arrange
    const tsconfigInput = serializeTSConfig({ references: [{ path: './tsconfig.src.json' }] });
    fsTestDouble.files[tsconfigFileName] = tsconfigInput;
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());

    // Act
    await sut.preprocess(project);

    // Assert
    expect(await project.files.get(tsconfigFileName)!.readContent()).eq(tsconfigInput);
  });

  it('should rewrite "extends" if it falls outside of sandbox', async () => {
    // Arrange
    const tsconfigInput = serializeTSConfig({ extends: '../tsconfig.settings.json' });
    fsTestDouble.files[tsconfigFileName] = tsconfigInput;
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());

    // Act
    await sut.preprocess(project);

    // Assert
    expect(await project.files.get(tsconfigFileName)!.readContent()).eq(serializeTSConfig({ extends: '../../../tsconfig.settings.json' }));
  });

  it('should rewrite "references" if it falls outside of sandbox', async () => {
    // Arrange
    fsTestDouble.files[tsconfigFileName] = serializeTSConfig({ references: [{ path: '../model' }] });
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());

    // Act
    await sut.preprocess(project);

    // Assert
    expect(await project.files.get(tsconfigFileName)!.readContent()).eq(
      serializeTSConfig({ references: [{ path: '../../../model/tsconfig.json' }] })
    );
  });

  it('should rewrite "include" array items located outside of the sandbox', async () => {
    // See https://github.com/stryker-mutator/stryker-js/issues/3281
    fsTestDouble.files[tsconfigFileName] = serializeTSConfig({
      include: ['./**/*', '../../../node_modules/self-service-server/lib/main/shared/@types/**/*.d.ts'],
    });
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());
    await sut.preprocess(project);
    expect(await project.files.get(tsconfigFileName)!.readContent()).eq(
      serializeTSConfig({
        include: ['./**/*', '../../../../../node_modules/self-service-server/lib/main/shared/@types/**/*.d.ts'],
      })
    );
  });

  it('should rewrite "exclude" array items located outside of the sandbox', async () => {
    fsTestDouble.files[tsconfigFileName] = serializeTSConfig({
      exclude: ['./**/*', '../foo.ts'],
    });
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());
    await sut.preprocess(project);
    expect(await project.files.get(tsconfigFileName)!.readContent()).eq(
      serializeTSConfig({
        exclude: ['./**/*', '../../../foo.ts'],
      })
    );
  });

  it('should rewrite "files" array items located outside of the sandbox', async () => {
    // See https://github.com/stryker-mutator/stryker-js/issues/3281
    fsTestDouble.files[tsconfigFileName] = serializeTSConfig({
      files: ['foo/bar.ts', '../global.d.ts'],
    });
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());
    await sut.preprocess(project);
    expect(await project.files.get(tsconfigFileName)!.readContent()).eq(
      serializeTSConfig({
        files: ['foo/bar.ts', '../../../global.d.ts'],
      })
    );
  });

  it('should not do anything when inPlace = true', async () => {
    testInjector.options.inPlace = true;
    const tsconfigInput = serializeTSConfig({ extends: '../tsconfig.settings.json' });
    fsTestDouble.files[tsconfigFileName] = tsconfigInput;
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());
    await sut.preprocess(project);
    expect(await project.files.get(tsconfigFileName)!.readContent()).eq(tsconfigInput);
  });

  it('should support comments and other settings', async () => {
    fsTestDouble.files[tsconfigFileName] = `{
       "extends": "../tsconfig.settings.json",
       "compilerOptions": {
         // Here are the options
         "target": "es5", // and a trailing comma
       }
      }`;
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());
    await sut.preprocess(project);
    expect(await project.files.get(tsconfigFileName)!.readContent()).eq(
      serializeTSConfig({ extends: '../../../tsconfig.settings.json', compilerOptions: { target: 'es5' } })
    );
  });

  it('should rewrite referenced tsconfig files that are also located in the sandbox', async () => {
    // Arrange
    fsTestDouble.files[tsconfigFileName] = serializeTSConfig({ extends: './tsconfig.settings.json', references: [{ path: './src' }] });
    fsTestDouble.files[path.resolve('tsconfig.settings.json')] = serializeTSConfig({ extends: '../../tsconfig.root-settings.json' });
    fsTestDouble.files[path.resolve('src/tsconfig.json')] = serializeTSConfig({ references: [{ path: '../../model' }] });
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());

    // Act
    await sut.preprocess(project);

    // Assert
    expect(await project.files.get(tsconfigFileName)!.readContent()).eq(
      serializeTSConfig({ extends: './tsconfig.settings.json', references: [{ path: './src' }] })
    );
    expect(await project.files.get(path.resolve('tsconfig.settings.json'))!.readContent()).eq(
      serializeTSConfig({ extends: '../../../../tsconfig.root-settings.json' })
    );
    expect(await project.files.get(path.resolve('src/tsconfig.json'))!.readContent()).eq(
      serializeTSConfig({ references: [{ path: '../../../../model/tsconfig.json' }] })
    );
  });

  it('should be able to rewrite a monorepo style project', async () => {
    // Arrange
    fsTestDouble.files[path.resolve('tsconfig.root.json')] = serializeTSConfig({
      extends: '../../tsconfig.settings.json',
      references: [{ path: 'src' }, { path: 'test/tsconfig.test.json' }],
    });

    fsTestDouble.files[path.resolve('src/tsconfig.json')] = serializeTSConfig({
      extends: '../../../tsconfig.settings.json',
      references: [{ path: '../../model' }],
    });
    fsTestDouble.files[path.resolve('test/tsconfig.test.json')] = serializeTSConfig({
      extends: '../tsconfig.root.json',
      references: [{ path: '../src' }],
    });
    testInjector.options.tsconfigFile = 'tsconfig.root.json';
    const project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());

    // Act
    await sut.preprocess(project);

    // Assert
    expect(await project.files.get(path.resolve('tsconfig.root.json'))!.readContent()).eq(
      serializeTSConfig({
        extends: '../../../../tsconfig.settings.json',
        references: [{ path: 'src' }, { path: 'test/tsconfig.test.json' }],
      })
    );
    expect(await project.files.get(path.resolve('src/tsconfig.json'))!.readContent()).eq(
      serializeTSConfig({
        extends: '../../../../../tsconfig.settings.json',
        references: [{ path: '../../../../model/tsconfig.json' }],
      })
    );
    expect(await project.files.get(path.resolve('test/tsconfig.test.json'))!.readContent()).eq(
      serializeTSConfig({ extends: '../tsconfig.root.json', references: [{ path: '../src' }] })
    );
  });
});
