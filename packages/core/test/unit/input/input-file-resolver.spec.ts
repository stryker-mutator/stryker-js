import path from 'path';
import { Dirent, promises as fsPromises } from 'fs';

import { File, MutationRange } from '@stryker-mutator/api/core';
import { SourceFile } from '@stryker-mutator/api/report';
import { assertions, factory, testInjector, tick } from '@stryker-mutator/test-helpers';
import { Task } from '@stryker-mutator/util';
import { expect } from 'chai';
import sinon from 'sinon';

import { coreTokens } from '../../../src/di';
import { InputFileResolver } from '../../../src/input';
import { BroadcastReporter } from '../../../src/reporters/broadcast-reporter';
import { Mock, mock } from '../../helpers/producers';

describe(InputFileResolver.name, () => {
  let reporterMock: Mock<BroadcastReporter>;
  let readFileStub: sinon.SinonStub;
  let readdirStub: sinon.SinonStubbedMember<typeof fsPromises.readdir>;

  beforeEach(() => {
    reporterMock = mock(BroadcastReporter);
    readdirStub = sinon.stub(fsPromises, 'readdir');
    readFileStub = sinon.stub(fsPromises, 'readFile');
  });

  it('should log a warning if no files were resolved', async () => {
    stubFileSystem({}); // emtpy dir
    const sut = createSut();
    await sut.resolve();
    expect(testInjector.logger.warn).calledWith(
      `No files found in directory ${process.cwd()} using ignore rules: ["node_modules",".git","/reports","/stryker.log",".stryker-tmp"]. Make sure you run Stryker from the root directory of your project with the correct "ignorePatterns".`
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
      const result = await sut.resolve();
      assertions.expectTextFilesEqual(result.files, [
        new File(path.resolve('app', 'app.component.js'), '@Component()'),
        new File(path.resolve('util', 'index.js'), 'foo.bar'),
        new File(path.resolve('util', 'object', 'object-helper.js'), 'export const helpers = {}'),
      ]);
      expect(readdirStub).calledWith(process.cwd(), { withFileTypes: true });
    });

    it('should respect ignore patterns', async () => {
      stubFileSystem({
        src: { 'index.js': 'export * from "./app"' },
        dist: { 'index.js': 'module.exports = require("./app")' },
      });
      testInjector.options.ignorePatterns = ['dist'];
      const sut = createSut();

      const result = await sut.resolve();

      assertions.expectTextFilesEqual(result.files, [new File(path.resolve('src', 'index.js'), 'export * from "./app"')]);
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

      const { files } = await sut.resolve();

      expect(files).lengthOf(1);
      expect(files[0].name).eq(path.resolve('packages', 'app', 'src', 'index.js'));
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
      const { files } = await sut.resolve();

      // Assert
      expect(files).lengthOf(1);
      expect(files[0].name).eq(path.resolve('index.js'));
    });

    it('should not ignore deep report directories by default', async () => {
      // Arrange
      stubFileSystem({
        app: { reports: { 'reporter.component.js': '' } },
      });
      const sut = createSut();

      // Act
      const { files } = await sut.resolve();

      // Assert
      expect(files).lengthOf(1);
      expect(files[0].name).eq(path.resolve('app', 'reports', 'reporter.component.js'));
    });

    it('should ignore a deep node_modules directory by default', async () => {
      // Arrange
      stubFileSystem({
        testResources: { 'require-resolve': { node_modules: { bar: { 'index.js': '' } } } },
      });
      const sut = createSut();

      // Act
      const { files } = await sut.resolve();

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
      const { files } = await sut.resolve();

      // Assert
      expect(files).lengthOf(1);
      expect(files[0].name).eq(path.resolve('index.js'));
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
      const { files } = await sut.resolve();

      // Assert
      expect(files).lengthOf(2);
      expect(files[0].name).eq(path.resolve('index.js'));
      expect(files[1].name).eq(path.resolve('node_modules', 'rimraf', 'index.js'));
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
      const { files } = await sut.resolve();

      // Assert
      expect(files).lengthOf(1);
      expect(files[0].name).eq(path.resolve('testResources', 'require-resolve', 'node_modules', 'bar', 'index.js'));
    });

    it('should reject if fs commands fail', async () => {
      const expectedError = factory.fileNotFoundError();
      readdirStub.rejects(expectedError);
      await expect(createSut().resolve()).rejectedWith(expectedError);
    });

    it('should allow whitelisting with "**"', async () => {
      stubFileSystem({
        src: { 'index.js': 'export * from "./app"' },
        dist: { 'index.js': 'module.exports = require("./app")' },
      });
      testInjector.options.ignorePatterns = ['**', '!src/**/*.js'];
      const sut = createSut();

      const { files } = await sut.resolve();

      assertions.expectTextFilesEqual(files, [new File(path.resolve('src', 'index.js'), 'export * from "./app"')]);
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

      const { files } = await sut.resolve();

      assertions.expectTextFilesEqual(files, [new File(path.resolve('app', 'src', 'index.js'), 'export * from "./app"')]);
    });

    it('should not open too many file handles', async () => {
      // Arrange
      const maxFileIO = 256;
      const sut = createSut();
      const fileHandles: Array<{ fileName: string; task: Task<Buffer> }> = [];
      for (let i = 0; i < maxFileIO + 1; i++) {
        const fileName = `file_${i}.js`;
        const readFileTask = new Task<Buffer>();
        fileHandles.push({ fileName, task: readFileTask });
        readFileStub.withArgs(sinon.match(fileName)).returns(readFileTask.promise);
      }
      readdirStub.withArgs(process.cwd(), sinon.match.object).resolves(fileHandles.map(({ fileName }) => createDirent(fileName, false)));

      // Act
      const onGoingWork = sut.resolve();
      await tick();
      expect(readFileStub).callCount(maxFileIO);
      fileHandles[0].task.resolve(Buffer.from('content'));
      await tick();

      // Assert
      expect(readFileStub).callCount(maxFileIO + 1);
      fileHandles.forEach(({ task }) => task.resolve(Buffer.from('content')));
      await onGoingWork;
    });
  });

  describe('without mutate files', () => {
    beforeEach(() => {
      stubFileSystem({
        'file1.js': 'file 1 content',
        'file2.js': 'file 2 content',
        'file3.js': 'file 3 content',
        'mute1.js': 'mutate 1 content',
        'mute2.js': 'mutate 2 content',
      });
    });

    it('should warn about dry-run', async () => {
      const sut = createSut();
      await sut.resolve();
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

    it('should remove specific mutant descriptors when matching with line and column', async () => {
      testInjector.options.mutate = ['mute1.js:1:2-2:2'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      const sut = createSut();
      const result = await sut.resolve();
      expect(result.filesToMutate.map((_) => _.name)).to.deep.equal([path.resolve('mute1.js')]);
    });

    it('should parse the mutation range', async () => {
      testInjector.options.mutate = ['mute1:1:2-2:2'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      const sut = createSut();
      const result = await sut.resolve();
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
          fileName: path.resolve('mute1'),
        },
      ];
      expect(result.mutationRanges).deep.eq(expectedRanges);
    });

    it('should default column numbers if not present', async () => {
      testInjector.options.mutate = ['mute1:6-12'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      const sut = createSut();
      const result = await sut.resolve();
      expect(result.mutationRanges[0].start).deep.eq({ column: 0, line: 5 });
      expect(result.mutationRanges[0].end).deep.eq({ column: Number.MAX_SAFE_INTEGER, line: 11 });
    });
  });

  describe('with mutate file patterns', () => {
    it('should result in the expected mutate files', async () => {
      stubFileSystemWith5Files();
      testInjector.options.mutate = ['mute*'];
      const sut = createSut();
      const result = await sut.resolve();
      expect(result.filesToMutate.map((_) => _.name)).to.deep.equal([path.resolve('mute1.js'), path.resolve('mute2.js')]);
      expect(result.files.map((file) => file.name)).to.deep.equal([
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
      const result = await sut.resolve();
      expect(result.filesToMutate.map((_) => _.name)).to.deep.equal([path.resolve('mute1.js')]);
    });

    it('should report OnAllSourceFilesRead', async () => {
      stubFileSystemWith5Files();
      testInjector.options.mutate = ['mute*'];
      const sut = createSut();
      await sut.resolve();
      const expected: SourceFile[] = [
        { path: path.resolve('file1.js'), content: 'file 1 content' },
        { path: path.resolve('file2.js'), content: 'file 2 content' },
        { path: path.resolve('file3.js'), content: 'file 3 content' },
        { path: path.resolve('mute1.js'), content: 'mutate 1 content' },
        { path: path.resolve('mute2.js'), content: 'mutate 2 content' },
      ];
      expect(reporterMock.onAllSourceFilesRead).calledWith(expected);
    });

    it('should report OnSourceFileRead', async () => {
      stubFileSystemWith5Files();
      testInjector.options.mutate = ['mute*'];
      const sut = createSut();
      await sut.resolve();
      const expected: SourceFile[] = [
        { path: path.resolve('file1.js'), content: 'file 1 content' },
        { path: path.resolve('file2.js'), content: 'file 2 content' },
        { path: path.resolve('file3.js'), content: 'file 3 content' },
        { path: path.resolve('mute1.js'), content: 'mutate 1 content' },
        { path: path.resolve('mute2.js'), content: 'mutate 2 content' },
      ];
      expected.forEach((sourceFile) => expect(reporterMock.onSourceFileRead).calledWith(sourceFile));
    });

    it('should warn about useless patterns custom "mutate" patterns', async () => {
      testInjector.options.mutate = ['src/**/*.js', '!src/index.js', 'types/global.d.ts'];
      stubFileSystem({
        src: {
          'foo.js': 'foo();',
        },
      });
      const sut = createSut();
      await sut.resolve();
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
      await sut.resolve();
      expect(testInjector.logger.warn).not.called;
    });
  });

  function createSut() {
    return testInjector.injector.provideValue(coreTokens.reporter, reporterMock).injectClass(InputFileResolver);
  }

  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  type DirectoryEntry = string | { [name: string]: DirectoryEntry };

  function stubFileSystem(dirEntry: DirectoryEntry, fullName = process.cwd()) {
    if (typeof dirEntry === 'string') {
      readFileStub.withArgs(fullName).resolves(Buffer.from(dirEntry));
    } else {
      readdirStub
        .withArgs(fullName, sinon.match.object)
        .resolves(Object.entries(dirEntry).map(([name, value]) => createDirent(name, typeof value !== 'string')));
      Object.entries(dirEntry).map(([name, value]) => stubFileSystem(value, path.resolve(fullName, name)));
    }
  }

  function createDirent(name: string, isDirectory: boolean): Dirent {
    const dummy = () => true;
    return {
      isBlockDevice: dummy,
      isCharacterDevice: dummy,
      isDirectory: () => isDirectory,
      isFIFO: dummy,
      isFile: () => !isDirectory,
      isSocket: dummy,
      isSymbolicLink: dummy,
      name,
    };
  }
});
