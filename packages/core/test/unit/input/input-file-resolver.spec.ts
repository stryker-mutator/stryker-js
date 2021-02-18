import os from 'os';
import path from 'path';
import fs from 'fs';

import { File } from '@stryker-mutator/api/core';
import { SourceFile } from '@stryker-mutator/api/report';
import { testInjector, factory, assertions, tick } from '@stryker-mutator/test-helpers';
import { childProcessAsPromised, errorToString, Task } from '@stryker-mutator/util';
import { expect } from 'chai';
import sinon from 'sinon';

import { coreTokens } from '../../../src/di';
import { InputFileResolver } from '../../../src/input/input-file-resolver';
import { BroadcastReporter } from '../../../src/reporters/broadcast-reporter';
import * as fileUtils from '../../../src/utils/file-utils';
import { Mock, mock } from '../../helpers/producers';

const createFiles = (...namesWithContent: Array<[string, string]>): File[] =>
  namesWithContent.map((nameAndContent): File => new File(path.resolve(nameAndContent[0]), Buffer.from(nameAndContent[1])));

describe(InputFileResolver.name, () => {
  let globStub: sinon.SinonStub;
  let sut: InputFileResolver;
  let reporterMock: Mock<BroadcastReporter>;
  let childProcessExecStub: sinon.SinonStub;
  let readFileStub: sinon.SinonStub;

  beforeEach(() => {
    reporterMock = mock(BroadcastReporter);
    globStub = sinon.stub(fileUtils, 'glob');
    readFileStub = sinon.stub(fs.promises, 'readFile');
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
    childProcessExecStub = sinon.stub(childProcessAsPromised, 'exec');
    testInjector.options.mutate = [];
  });

  it('should use git to identify files if files array is missing', async () => {
    sut = createSut();
    childProcessExecStub.resolves({
      stdout: Buffer.from(`
    file1.js
    foo/bar/baz.ts
    `),
    });
    const result = await sut.resolve();
    expect(childProcessExecStub).calledWith('git ls-files --others --exclude-standard --cached --exclude /.stryker-tmp/*', {
      maxBuffer: 10 * 1000 * 1024,
    });
    expect(result.files.map((file) => file.name)).deep.eq([path.resolve('file1.js'), path.resolve('foo/bar/baz.ts')]);
  });

  it('should exclude the overridden tempDirName when identifying files with git', async () => {
    // Arrange
    testInjector.options.tempDirName = 'foo-bar';
    sut = createSut();
    childProcessExecStub.resolves({
      stdout: Buffer.from(''),
    });

    // Act
    await sut.resolve();

    // Assert
    expect(childProcessExecStub).calledWith('git ls-files --others --exclude-standard --cached --exclude /foo-bar/*');
  });

  it('should reject if there is no `files` array and `git ls-files` command fails', () => {
    const expectedError = new Error('fatal: Not a git repository (or any of the parent directories): .git');
    childProcessExecStub.rejects(expectedError);
    return expect(createSut().resolve()).rejectedWith(
      `Cannot determine input files. Either specify a \`files\` array in your stryker configuration, or make sure "${process.cwd()}" is located inside a git repository. Inner error: ${errorToString(
        expectedError
      )}`
    );
  });

  it('should log a warning if no files were resolved', async () => {
    testInjector.options.files = [];
    sut = createSut();
    await sut.resolve();
    expect(testInjector.logger.warn).calledWith(
      sinon
        .match(`No files selected. Please make sure you either${os.EOL} (1) Run Stryker inside a Git repository`)
        .and(sinon.match('(2) Specify the `files` property in your Stryker configuration'))
    );
  });

  it('should be able to handle deleted files reported by `git ls-files`', async () => {
    sut = createSut();
    childProcessExecStub.resolves({
      stdout: Buffer.from(`
      deleted/file.js
    `),
    });
    const error = factory.fileNotFoundError();
    readFileStub.withArgs('deleted/file.js').rejects(error);
    const result = await sut.resolve();
    expect(result.files).lengthOf(0);
  });

  it('should be able to handle directories reported by `git ls-files` (submodules)', async () => {
    sut = createSut();
    childProcessExecStub.resolves({
      stdout: Buffer.from(`
      submoduleDir
    `),
    });
    const fileIsDirError = factory.createIsDirError();
    readFileStub.withArgs('submoduleDir').rejects(fileIsDirError);
    const result = await sut.resolve();
    expect(result.files).lengthOf(0);
  });

  it('should decode encoded file names', async () => {
    sut = createSut();
    childProcessExecStub.resolves({
      // \303\245 = å
      // \360\237\220\261\342\200\215\360\237\221\223 = 🐱‍👓
      // On linux, files are allowed to contain `\`, which is also escaped in git output
      stdout: Buffer.from(`
      "\\303\\245.js"
      "src/\\360\\237\\220\\261\\342\\200\\215\\360\\237\\221\\223ninja.cat.js"
      "a\\\\test\\\\file.js"
    `),
    });
    const files = await sut.resolve();
    assertions.expectTextFilesEqual(files.files, [
      new File(path.resolve('a\\test\\file.js'), ''),
      new File(path.resolve('src/🐱‍👓ninja.cat.js'), ''),
      new File(path.resolve('å.js'), ''),
    ]);
  });

  it('should reject when a globbing expression results in a reject', () => {
    testInjector.options.files = ['fileError', 'fileError'];
    testInjector.options.mutate = ['file1'];
    sut = createSut();
    const expectedError = new Error('ERROR: something went wrong');
    globStub.withArgs('fileError').rejects(expectedError);
    return expect(sut.resolve()).rejectedWith(expectedError);
  });

  it('should not open too many file handles', async () => {
    // Arrange
    const maxFileIO = 256;
    sut = createSut();
    const fileHandles: Array<{ fileName: string; task: Task<Buffer> }> = [];
    for (let i = 0; i < maxFileIO + 1; i++) {
      const fileName = `file_${i}.js`;
      const readFileTask = new Task<Buffer>();
      fileHandles.push({ fileName, task: readFileTask });
      readFileStub.withArgs(sinon.match(fileName)).returns(readFileTask.promise);
    }
    childProcessExecStub.resolves({
      stdout: Buffer.from(fileHandles.map(({ fileName }) => fileName).join(os.EOL)),
    });

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

  describe('with specific mutant definitions', () => {
    it('should remove specific mutant descriptors when matching', async () => {
      testInjector.options.mutate = ['mute1:0:0:1:0'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      sut = createSut();
      const result = await sut.resolve();
      expect(result.filesToMutate.map((_) => _.name)).to.deep.equal([path.resolve('/mute1.js')]);
    });

    it('should not allow both glob patterns and specific mutants', () => {
      testInjector.options.mutate = ['mute*:1:0:1:0'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      sut = createSut();
      return expect(sut.resolve()).to.be.rejectedWith('Do not use glob patterns with specific mutants on the glob pattern');
    });
  });

  describe('with mutate file expressions', () => {
    it('should result in the expected mutate files', async () => {
      testInjector.options.mutate = ['mute*'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      sut = createSut();
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
      sut = createSut();
      const result = await sut.resolve();
      expect(result.filesToMutate.map((_) => _.name)).to.deep.equal([path.resolve('/mute1.js')]);
    });

    it('should report OnAllSourceFilesRead', async () => {
      testInjector.options.mutate = ['mute*'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      sut = createSut();
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
      sut = createSut();
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
      testInjector.options.files = ['file1', 'mute1'];
      sut = createSut();
    });

    it('should warn about dry-run', async () => {
      await sut.resolve();
      expect(testInjector.logger.warn).calledWith(
        sinon.match('No files marked to be mutated, Stryker will perform a dry-run without actually mutating anything.')
      );
    });
  });

  describe('with file expressions that resolve in different order', () => {
    beforeEach(() => {
      testInjector.options.files = ['fileWhichResolvesLast', 'fileWhichResolvesFirst'];
      sut = createSut();
      globStub.withArgs('fileWhichResolvesLast').resolves(['file1']);
      globStub.withArgs('fileWhichResolvesFirst').resolves(['file2']);
    });

    it('should retain original glob order', async () => {
      const result = await sut.resolve();
      expect(result.files.map((m) => m.name.substr(m.name.length - 5))).to.deep.equal(['file1', 'file2']);
    });
  });

  describe('when a globbing expression does not result in a result', () => {
    it('should log a warning', async () => {
      testInjector.options.files = ['file1', 'notExists'];
      testInjector.options.mutate = ['file1'];
      sut = createSut();
      await sut.resolve();
      expect(testInjector.logger.warn).to.have.been.calledWith('Globbing expression "notExists" did not result in any files.');
    });

    it('should not log a warning if the globbing expression was the default logging expression', async () => {
      const config = factory.strykerOptions();
      testInjector.options.files = config.files;
      testInjector.options.mutate = config.mutate;
      sut = createSut();
      childProcessExecStub.resolves({ stdout: Buffer.from('src/foobar.js') });
      globStub.withArgs(config.mutate[0]).returns(['src/foobar.js']);
      await sut.resolve();
      expect(testInjector.logger.warn).not.called;
    });
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
      assertFilesEqual(result.files, createFiles(['/file1.js', 'file 1 content'], ['/file2.js', 'file 2 content'], ['/file3.js', 'file 3 content']));
    });

    it('should order files by expression order', async () => {
      testInjector.options.files = ['file2', 'file*'];
      const result = await createSut().resolve();
      assertFilesEqual(result.files, createFiles(['/file1.js', 'file 1 content'], ['/file2.js', 'file 2 content'], ['/file3.js', 'file 3 content']));
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
});
