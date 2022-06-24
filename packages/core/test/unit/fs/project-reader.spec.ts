import path from 'path';

import { MutateDescription, MutationRange } from '@stryker-mutator/api/core';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { I } from '@stryker-mutator/util';
import { expect } from 'chai';
import sinon from 'sinon';

import { ProjectReader } from '../../../src/fs/project-reader.js';
import { coreTokens } from '../../../src/di/index.js';
import { FileSystem } from '../../../src/fs/file-system.js';
import { createDirent, createFileSystemMock } from '../../helpers/producers.js';

describe(ProjectReader.name, () => {
  let fsMock: sinon.SinonStubbedInstance<I<FileSystem>>;

  beforeEach(() => {
    fsMock = createFileSystemMock();
  });

  it('should log a warning if no files were resolved', async () => {
    stubFileSystem({}); // empty dir
    const sut = createSut();
    await sut.read();
    expect(testInjector.logger.warn).calledWith(
      `No files found in directory ${process.cwd()} using ignore rules: ["node_modules",".git","/reports","*.tsbuildinfo","/stryker.log",".stryker-tmp"]. Make sure you run Stryker from the root directory of your project with the correct "ignorePatterns".`
    );
  });

  describe('file resolving', () => {
    it('should discover files recursively using readdir', async () => {
      // Arrange
      stubFileSystem({
        app: {
          'app.component.js': '@Component()',
        },
        util: {
          'index.js': 'foo.bar',
          object: {
            'object-helper.js': 'export const helpers = {}',
          },
        },
      });
      const sut = createSut();

      // Act
      const result = await sut.read();

      // Assert
      expect([...result.files.keys()]).deep.eq([
        path.resolve('app', 'app.component.js'),
        path.resolve('util', 'index.js'),
        path.resolve('util', 'object', 'object-helper.js'),
      ]);
      expect(await result.files.get(path.resolve('app', 'app.component.js'))!.readContent()).eq('@Component()');
      expect(await result.files.get(path.resolve('util', 'index.js'))!.readContent()).eq('foo.bar');
      expect(await result.files.get(path.resolve('util', 'object', 'object-helper.js'))!.readContent()).eq('export const helpers = {}');
      expect(fsMock.readdir).calledWith(process.cwd(), { withFileTypes: true });
    });
    it('should respect ignore patterns', async () => {
      stubFileSystem({
        src: { 'index.js': 'export * from "./app"' },
        dist: { 'index.js': 'module.exports = require("./app")' },
      });
      testInjector.options.ignorePatterns = ['dist'];
      const sut = createSut();
      const result = await sut.read();
      expect([...result.files.keys()]).deep.eq([path.resolve('src', 'index.js')]);
    });
    it('should respect deep ignore patterns', async () => {
      stubFileSystem({
        packages: {
          app: {
            src: { 'index.js': 'export * from "./app"' },
            dist: { 'index.js': 'module.exports = require("./app")' },
          },
        },
      });
      testInjector.options.ignorePatterns = ['/packages/*/dist'];
      const sut = createSut();
      const { files } = await sut.read();
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(path.resolve('packages', 'app', 'src', 'index.js'));
    });
    it('should ignore node_modules, .git, reports, stryker.log, *.tsbuildinfo and .stryker-tmp by default', async () => {
      // Arrange
      stubFileSystem({
        '.git': { config: '' },
        node_modules: { rimraf: { 'index.js': '' } },
        '.stryker-tmp': { 'stryker-sandbox-123': { src: { 'index.js': '' } } },
        'index.js': '',
        'stryker.log': '',
        'tsconfig.src.tsbuildinfo': '',
        dist: {
          'tsconfig.tsbuildinfo': '',
        },
        reports: { mutation: { 'mutation.json': '' } },
      });
      const sut = createSut();

      // Act
      const { files } = await sut.read();

      // Assert
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(path.resolve('index.js'));
    });
    it('should not ignore deep report directories by default', async () => {
      // Arrange
      stubFileSystem({
        app: { reports: { 'reporter.component.js': '' } },
      });
      const sut = createSut();
      // Act
      const { files } = await sut.read();
      // Assert
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(path.resolve('app', 'reports', 'reporter.component.js'));
    });
    it('should ignore a deep node_modules directory by default', async () => {
      // Arrange
      stubFileSystem({
        testResources: { 'require-resolve': { node_modules: { bar: { 'index.js': '' } } } },
      });
      const sut = createSut();
      // Act
      const { files } = await sut.read();
      // Assert
      expect(files).lengthOf(0);
    });
    it('should ignore an alternative stryker-tmp dir', async () => {
      // Arrange
      stubFileSystem({
        '.git': { config: '' },
        node_modules: { rimraf: { 'index.js': '' } },
        'stryker-tmp': { 'stryker-sandbox-123': { src: { 'index.js': '' } } },
        'index.js': '',
      });
      testInjector.options.tempDirName = 'stryker-tmp';
      const sut = createSut();
      // Act
      const { files } = await sut.read();
      // Assert
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(path.resolve('index.js'));
    });
    it('should allow un-ignore', async () => {
      // Arrange
      stubFileSystem({
        '.git': { config: '' },
        node_modules: { rimraf: { 'index.js': '' } },
        '.stryker-tmp': { 'stryker-sandbox-123': { src: { 'index.js': '' } } },
        'index.js': '',
      });
      testInjector.options.ignorePatterns = ['!node_modules'];
      const sut = createSut();
      // Act
      const { files } = await sut.read();
      // Assert
      expect(files).lengthOf(2);
      expect(new Set(files.keys())).deep.eq(new Set([path.resolve('index.js'), path.resolve('node_modules', 'rimraf', 'index.js')]));
    });
    it('should allow un-ignore deep node_modules directory', async () => {
      // Arrange
      stubFileSystem({
        node_modules: { rimraf: { 'index.js': '' } },
        testResources: { 'require-resolve': { node_modules: { bar: { 'index.js': '' } } } },
      });
      testInjector.options.ignorePatterns = ['!testResources/**/node_modules'];
      const sut = createSut();
      // Act
      const { files } = await sut.read();
      // Assert
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(path.resolve('testResources', 'require-resolve', 'node_modules', 'bar', 'index.js'));
    });
    it('should reject if fs commands fail', async () => {
      const expectedError = factory.fileNotFoundError();
      fsMock.readdir.rejects(expectedError);
      await expect(createSut().read()).rejectedWith(expectedError);
    });
    it('should allow whitelisting with "**"', async () => {
      stubFileSystem({
        src: { 'index.js': 'export * from "./app"' },
        dist: { 'index.js': 'module.exports = require("./app")' },
      });
      testInjector.options.ignorePatterns = ['**', '!src/**/*.js'];
      const sut = createSut();
      const { files } = await sut.read();
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(path.resolve('src', 'index.js'));
    });
    it('should allow deep whitelisting with "**"', async () => {
      stubFileSystem({
        app: {
          src: { 'index.js': 'export * from "./app"' },
        },
        dist: { 'index.js': 'module.exports = require("./app")' },
      });
      testInjector.options.ignorePatterns = ['**', '!app/src/index.js'];
      const sut = createSut();
      const { files } = await sut.read();
      expect(files).lengthOf(1);
      expect(files.keys().next().value).eq(path.resolve('app', 'src', 'index.js'));
    });
    describe('without mutate files', () => {
      it('should warn about dry-run', async () => {
        // Arrange
        stubFileSystem({
          'file1.js': 'file 1 content',
          'file2.js': 'file 2 content',
          'file3.js': 'file 3 content',
          'mute1.js': 'mutate 1 content',
          'mute2.js': 'mutate 2 content',
        });
        // Act
        const sut = createSut();
        await sut.read();

        // Assert
        expect(testInjector.logger.warn).calledWith(
          'No files marked to be mutated, Stryker will perform a dry-run without actually mutating anything. You can configure the `mutate` property in your config file (or use `--mutate` via command line).'
        );
      });
    });
    function stubFileSystemWith5Files() {
      stubFileSystem({
        'file1.js': 'file 1 content',
        'file2.js': 'file 2 content',
        'file3.js': 'file 3 content',
        'mute1.js': 'mutate 1 content',
        'mute2.js': 'mutate 2 content',
      });
    }
    describe('with mutation range definitions', () => {
      beforeEach(() => {
        stubFileSystem({
          'file1.js': 'file 1 content',
          'file2.js': 'file 2 content',
          'file3.js': 'file 3 content',
          'mute1.js': 'mutate 1 content',
          'mute2.js': 'mutate 2 content',
        });
      });
      it('should parse the mutation range', async () => {
        // Arrange
        testInjector.options.mutate = ['mute1.js:1:2-2:2'];
        const sut = createSut();

        // Act
        const result = await sut.read();

        // Assert
        const expectedFileName = path.resolve('mute1.js');
        const expectedRanges: MutationRange[] = [
          {
            start: {
              column: 2,
              line: 0, // internally, Stryker works 0-based
            },
            end: {
              column: 2,
              line: 1,
            },
          },
        ];
        expect([...result.filesToMutate.keys()]).deep.eq([expectedFileName]);
        expect(result.filesToMutate.get(expectedFileName)!.mutate).deep.eq(expectedRanges);
      });

      it('should default column numbers if not present', async () => {
        testInjector.options.mutate = ['mute1.js:6-12'];
        const sut = createSut();
        const result = await sut.read();
        const expectedMutate: MutateDescription = [mutateRange(5, 0, 11, Number.MAX_SAFE_INTEGER)];
        expect(result.filesToMutate).lengthOf(1);
        expect(result.filesToMutate.get(path.resolve('mute1.js'))!.mutate).deep.eq(expectedMutate);
      });

      it('should allow multiple mutation ranges', async () => {
        testInjector.options.mutate = ['mute1.js:6-12', 'mute1.js:50-60'];
        const sut = createSut();
        const result = await sut.read();
        const expectedMutate: MutateDescription = [mutateRange(5, 0, 11, Number.MAX_SAFE_INTEGER), mutateRange(49, 0, 59, Number.MAX_SAFE_INTEGER)];
        expect(result.filesToMutate).lengthOf(1);
        expect(result.filesToMutate.get(path.resolve('mute1.js'))!.mutate).deep.eq(expectedMutate);
      });
    });
    describe('with mutate file patterns', () => {
      it('should result in the expected mutate files', async () => {
        stubFileSystemWith5Files();
        testInjector.options.mutate = ['mute*'];
        const sut = createSut();
        const result = await sut.read();
        expect([...result.filesToMutate.keys()]).to.deep.equal([path.resolve('mute1.js'), path.resolve('mute2.js')]);
        expect([...result.files.keys()]).to.deep.equal([
          path.resolve('file1.js'),
          path.resolve('file2.js'),
          path.resolve('file3.js'),
          path.resolve('mute1.js'),
          path.resolve('mute2.js'),
        ]);
      });
      it('should only report a mutate file when it is included in the resolved files', async () => {
        stubFileSystemWith5Files();
        testInjector.options.mutate = ['mute*'];
        testInjector.options.ignorePatterns = ['mute2.js'];
        const sut = createSut();
        const result = await sut.read();
        expect([...result.filesToMutate.keys()]).to.deep.equal([path.resolve('mute1.js')]);
      });
      it('should warn about useless patterns custom "mutate" patterns', async () => {
        testInjector.options.mutate = ['src/**/*.js', '!src/index.js', 'types/global.d.ts'];
        stubFileSystem({
          src: {
            'foo.js': 'foo();',
          },
        });
        const sut = createSut();
        await sut.read();
        expect(testInjector.logger.warn).calledTwice;
        expect(testInjector.logger.warn).calledWith('Glob pattern "!src/index.js" did not exclude any files.');
        expect(testInjector.logger.warn).calledWith('Glob pattern "types/global.d.ts" did not result in any files.');
      });
      it('should not warn about useless patterns if "mutate" isn\'t overridden', async () => {
        stubFileSystem({
          src: {
            'foo.js': 'foo();',
          },
        });
        const sut = createSut();
        await sut.read();
        expect(testInjector.logger.warn).not.called;
      });
    });
  });

  function mutateRange(startLine: number, startColumn: number, endLine: number, endColumn: number): MutationRange {
    return {
      start: { line: startLine, column: startColumn },
      end: { line: endLine, column: endColumn },
    };
  }

  function createSut() {
    return testInjector.injector.provideValue(coreTokens.fs, fsMock).injectClass(ProjectReader);
  }

  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  type DirectoryEntry = string | { [name: string]: DirectoryEntry };

  function stubFileSystem(dirEntry: DirectoryEntry, fullName = process.cwd()) {
    if (typeof dirEntry === 'string') {
      fsMock.readFile.withArgs(fullName).resolves(dirEntry);
    } else {
      fsMock.readdir
        .withArgs(fullName, sinon.match.object)
        .resolves(Object.entries(dirEntry).map(([name, value]) => createDirent({ name, isDirectory: typeof value !== 'string' })));
      Object.entries(dirEntry).map(([name, value]) => stubFileSystem(value, path.resolve(fullName, name)));
    }
  }
});
