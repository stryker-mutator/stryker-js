import os from 'os';
import path from 'path';
import { promises as fsPromises } from 'fs';

import { File, MutationRange } from '@stryker-mutator/api/core';
import { SourceFile } from '@stryker-mutator/api/report';
import { assertions, factory, testInjector, tick } from '@stryker-mutator/test-helpers';
import { Task } from '@stryker-mutator/util';
import { expect } from 'chai';
import sinon from 'sinon';

import { Dirent } from 'node:fs';

import { coreTokens } from '../../../src/di';
import { InputFileResolver } from '../../../src/input';
import { BroadcastReporter } from '../../../src/reporters/broadcast-reporter';
import * as fileUtils from '../../../src/utils/file-utils';
import { Mock, mock } from '../../helpers/producers';

const createFiles = (...namesWithContent: Array<[string, string]>): File[] =>
  namesWithContent.map((nameAndContent): File => new File(path.resolve(nameAndContent[0]), Buffer.from(nameAndContent[1])));

describe(InputFileResolver.name, () => {
  let globStub: sinon.SinonStub;
  let reporterMock: Mock<BroadcastReporter>;
  let readFileStub: sinon.SinonStub;
  let readdirStub: sinon.SinonStubbedMember<typeof fsPromises.readdir>;

  beforeEach(() => {
    reporterMock = mock(BroadcastReporter);
    globStub = sinon.stub(fileUtils, 'glob');
    readdirStub = sinon.stub(fsPromises, 'readdir');
    readFileStub = sinon.stub(fsPromises, 'readFile');
    testInjector.options.mutate = [];
  });

  it('should log a warning if no files were resolved', async () => {
    testInjector.options.files = [];
    const sut = createSut();
    await sut.resolve();
    expect(testInjector.logger.warn).calledWith(
      sinon
        .match(`No files selected. Please make sure you either${os.EOL} (1) Run Stryker inside a Git repository`)
        .and(sinon.match('(2) Specify the `files` property in your Stryker configuration'))
    );
  });

  describe('without "files"', () => {
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

    it('should ignore node_modules, .git, reports and .stryker-tmp by default', async () => {
      // Arrange
      stubFileSystem({
        '.git': { config: '' },
        node_modules: { rimraf: { 'index.js': '' } },
        '.stryker-tmp': { 'stryker-sandbox-123': { src: { 'index.js': '' } } },
        'index.js': '',
        reports: { mutation: { 'mutation.json': '' } },
      });
      const sut = createSut();

      // Act
      const { files } = await sut.resolve();

      // Assert
      expect(files).lengthOf(1);
      expect(files[0].name).eq(path.resolve('index.js'));
    });

    it('should not ignore deep-report directories', async () => {
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

    it('should reject if fs commands fail', async () => {
      const expectedError = factory.fileNotFoundError();
      readdirStub.rejects(expectedError);
      await expect(createSut().resolve()).rejectedWith(expectedError);
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

  describe('with "files"', () => {
    beforeEach(() => {
      readFileStub
        .withArgs(sinon.match.string)
        .resolves(Buffer.from('')) // fallback
        .withArgs(sinon.match('file1'))
        .resolves(Buffer.from('file 1 content'))
        .withArgs(sinon.match('file2'))
        .resolves(Buffer.from('file 2 content'))
        .withArgs(sinon.match('file3'))
        .resolves(Buffer.from('file 3 content'))
        .withArgs(sinon.match('mute1'))
        .resolves(Buffer.from('mutate 1 content'))
        .withArgs(sinon.match('mute2'))
        .resolves(Buffer.from('mutate 2 content'));

      globStub.withArgs('mute*').resolves(['/mute1.js', '/mute2.js']);
      globStub.withArgs('mute1').resolves(['/mute1.js']);
      globStub.withArgs('mute2').resolves(['/mute2.js']);
      globStub.withArgs('file1').resolves(['/file1.js']);
      globStub.withArgs('file2').resolves(['/file2.js']);
      globStub.withArgs('file3').resolves(['/file3.js']);
      globStub.withArgs('file*').resolves(['/file1.js', '/file2.js', '/file3.js']);
      globStub.resolves([]); // default
    });

    it('should reject when a globbing expression results in a reject', () => {
      testInjector.options.files = ['fileError', 'fileError'];
      testInjector.options.mutate = ['file1'];
      const sut = createSut();
      const expectedError = new Error('ERROR: something went wrong');
      globStub.withArgs('fileError').rejects(expectedError);
      return expect(sut.resolve()).rejectedWith(expectedError);
    });

    it('should log a warning when a globbing expression does not result in a result', async () => {
      testInjector.options.files = ['file1', 'notExists'];
      testInjector.options.mutate = ['file1'];
      const sut = createSut();
      await sut.resolve();
      expect(testInjector.logger.warn).to.have.been.calledWith('Globbing expression "notExists" did not result in any files.');
    });

    describe('when excluding files with "!"', () => {
      it('should exclude the files that were previously included', async () => {
        testInjector.options.files = ['file2', 'file1', '!file2'];
        const suite = createSut();
        const result = await suite.resolve();
        assertFilesEqual(result.files, createFiles(['/file1.js', 'file 1 content']));
      });

      it('should exclude the files that were previously with a wild card', async () => {
        testInjector.options.files = ['file*', '!file2'];
        const suite = createSut();
        const result = await suite.resolve();
        assertFilesEqual(result.files, createFiles(['/file1.js', 'file 1 content'], ['/file3.js', 'file 3 content']));
      });

      it('should not exclude files when the globbing expression results in an empty array', async () => {
        testInjector.options.files = ['file2', '!does/not/exist'];
        const suite = createSut();
        const result = await suite.resolve();
        assertFilesEqual(result.files, createFiles(['/file2.js', 'file 2 content']));
      });
    });

    describe('when provided duplicate files', () => {
      it('should deduplicate files that occur more than once', async () => {
        testInjector.options.files = ['file2', 'file2'];
        const result = await createSut().resolve();
        assertFilesEqual(result.files, createFiles(['/file2.js', 'file 2 content']));
      });

      it('should deduplicate files that previously occurred in a wildcard expression', async () => {
        testInjector.options.files = ['file*', 'file2'];
        const result = await createSut().resolve();
        assertFilesEqual(
          result.files,
          createFiles(['/file1.js', 'file 1 content'], ['/file2.js', 'file 2 content'], ['/file3.js', 'file 3 content'])
        );
      });

      it('should order files by expression order', async () => {
        testInjector.options.files = ['file2', 'file*'];
        const result = await createSut().resolve();
        assertFilesEqual(
          result.files,
          createFiles(['/file1.js', 'file 1 content'], ['/file2.js', 'file 2 content'], ['/file3.js', 'file 3 content'])
        );
      });
    });
  });

  describe('with mutation range definitions', () => {
    beforeEach(() => {
      readFileStub
        .withArgs(sinon.match.string)
        .resolves(Buffer.from('')) // fallback
        .withArgs(sinon.match('file1'))
        .resolves(Buffer.from('file 1 content'))
        .withArgs(sinon.match('file2'))
        .resolves(Buffer.from('file 2 content'))
        .withArgs(sinon.match('file3'))
        .resolves(Buffer.from('file 3 content'))
        .withArgs(sinon.match('mute1'))
        .resolves(Buffer.from('mutate 1 content'))
        .withArgs(sinon.match('mute2'))
        .resolves(Buffer.from('mutate 2 content'));

      globStub.withArgs('mute*').resolves(['/mute1.js', '/mute2.js']);
      globStub.withArgs('mute1').resolves(['/mute1.js']);
      globStub.withArgs('mute2').resolves(['/mute2.js']);
      globStub.withArgs('file1').resolves(['/file1.js']);
      globStub.withArgs('file2').resolves(['/file2.js']);
      globStub.withArgs('file3').resolves(['/file3.js']);
      globStub.withArgs('file*').resolves(['/file1.js', '/file2.js', '/file3.js']);
      globStub.resolves([]); // default
    });

    it('should remove specific mutant descriptors when matching with line and column', async () => {
      testInjector.options.mutate = ['mute1:1:2-2:2'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      const sut = createSut();
      const result = await sut.resolve();
      expect(result.filesToMutate.map((_) => _.name)).to.deep.equal([path.resolve('/mute1.js')]);
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

  describe('with mutate file expressions', () => {
    beforeEach(() => {
      readFileStub
        .withArgs(sinon.match.string)
        .resolves(Buffer.from('')) // fallback
        .withArgs(sinon.match('file1'))
        .resolves(Buffer.from('file 1 content'))
        .withArgs(sinon.match('file2'))
        .resolves(Buffer.from('file 2 content'))
        .withArgs(sinon.match('file3'))
        .resolves(Buffer.from('file 3 content'))
        .withArgs(sinon.match('mute1'))
        .resolves(Buffer.from('mutate 1 content'))
        .withArgs(sinon.match('mute2'))
        .resolves(Buffer.from('mutate 2 content'));

      globStub.withArgs('mute*').resolves(['/mute1.js', '/mute2.js']);
      globStub.withArgs('mute1').resolves(['/mute1.js']);
      globStub.withArgs('mute2').resolves(['/mute2.js']);
      globStub.withArgs('file1').resolves(['/file1.js']);
      globStub.withArgs('file2').resolves(['/file2.js']);
      globStub.withArgs('file3').resolves(['/file3.js']);
      globStub.withArgs('file*').resolves(['/file1.js', '/file2.js', '/file3.js']);
      globStub.resolves([]); // default
    });

    it('should result in the expected mutate files', async () => {
      testInjector.options.mutate = ['mute*'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      const sut = createSut();
      const result = await sut.resolve();
      expect(result.filesToMutate.map((_) => _.name)).to.deep.equal([path.resolve('/mute1.js'), path.resolve('/mute2.js')]);
      expect(result.files.map((file) => file.name)).to.deep.equal([
        path.resolve('/file1.js'),
        path.resolve('/file2.js'),
        path.resolve('/file3.js'),
        path.resolve('/mute1.js'),
        path.resolve('/mute2.js'),
      ]);
    });

    it('should only report a mutate file when it is included in the resolved files', async () => {
      testInjector.options.mutate = ['mute*'];
      testInjector.options.files = ['file1', 'mute1', 'file2', /*'mute2'*/ 'file3'];
      const sut = createSut();
      const result = await sut.resolve();
      expect(result.filesToMutate.map((_) => _.name)).to.deep.equal([path.resolve('/mute1.js')]);
    });

    it('should report OnAllSourceFilesRead', async () => {
      testInjector.options.mutate = ['mute*'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      const sut = createSut();
      await sut.resolve();
      const expected: SourceFile[] = [
        { path: path.resolve('/file1.js'), content: 'file 1 content' },
        { path: path.resolve('/file2.js'), content: 'file 2 content' },
        { path: path.resolve('/file3.js'), content: 'file 3 content' },
        { path: path.resolve('/mute1.js'), content: 'mutate 1 content' },
        { path: path.resolve('/mute2.js'), content: 'mutate 2 content' },
      ];
      expect(reporterMock.onAllSourceFilesRead).calledWith(expected);
    });

    it('should report OnSourceFileRead', async () => {
      testInjector.options.mutate = ['mute*'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      const sut = createSut();
      await sut.resolve();
      const expected: SourceFile[] = [
        { path: path.resolve('/file1.js'), content: 'file 1 content' },
        { path: path.resolve('/file2.js'), content: 'file 2 content' },
        { path: path.resolve('/file3.js'), content: 'file 3 content' },
        { path: path.resolve('/mute1.js'), content: 'mutate 1 content' },
        { path: path.resolve('/mute2.js'), content: 'mutate 2 content' },
      ];
      expected.forEach((sourceFile) => expect(reporterMock.onSourceFileRead).calledWith(sourceFile));
    });
  });

  describe('without mutate files', () => {
    beforeEach(() => {
      readFileStub
        .withArgs(sinon.match.string)
        .resolves(Buffer.from('')) // fallback
        .withArgs(sinon.match('file1'))
        .resolves(Buffer.from('file 1 content'))
        .withArgs(sinon.match('file2'))
        .resolves(Buffer.from('file 2 content'))
        .withArgs(sinon.match('file3'))
        .resolves(Buffer.from('file 3 content'))
        .withArgs(sinon.match('mute1'))
        .resolves(Buffer.from('mutate 1 content'))
        .withArgs(sinon.match('mute2'))
        .resolves(Buffer.from('mutate 2 content'));

      globStub.withArgs('mute*').resolves(['/mute1.js', '/mute2.js']);
      globStub.withArgs('mute1').resolves(['/mute1.js']);
      globStub.withArgs('mute2').resolves(['/mute2.js']);
      globStub.withArgs('file1').resolves(['/file1.js']);
      globStub.withArgs('file2').resolves(['/file2.js']);
      globStub.withArgs('file3').resolves(['/file3.js']);
      globStub.withArgs('file*').resolves(['/file1.js', '/file2.js', '/file3.js']);
      globStub.resolves([]); // default
    });

    beforeEach(() => {
      testInjector.options.files = ['file1', 'mute1'];
    });

    it('should warn about dry-run', async () => {
      const sut = createSut();
      await sut.resolve();
      expect(testInjector.logger.warn).calledWith(
        sinon.match('No files marked to be mutated, Stryker will perform a dry-run without actually mutating anything.')
      );
    });
  });

  function assertFilesEqual(actual: readonly File[], expected: readonly File[]) {
    expect(actual).lengthOf(expected.length);
    expected.forEach((expectedFile, index) => {
      expect(actual[index].name).eq(expectedFile.name);
      expect(actual[index].textContent).eq(expectedFile.textContent);
    });
  }

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
