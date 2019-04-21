import os = require('os');
import { Config } from '@stryker-mutator/api/config';
import { File } from '@stryker-mutator/api/core';
import { SourceFile } from '@stryker-mutator/api/report';
import { testInjector } from '@stryker-mutator/test-helpers';
import { createIsDirError, fileNotFoundError } from '@stryker-mutator/test-helpers/src/factory';
import { childProcessAsPromised, errorToString, fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';
import * as path from 'path';
import * as sinon from 'sinon';
import { coreTokens } from '../../../src/di';
import InputFileResolver from '../../../src/input/InputFileResolver';
import BroadcastReporter from '../../../src/reporters/BroadcastReporter';
import * as fileUtils from '../../../src/utils/fileUtils';
import { Mock, mock } from '../../helpers/producers';

const files = (...namesWithContent: [string, string][]): File[] =>
  namesWithContent.map((nameAndContent): File => new File(
    path.resolve(nameAndContent[0]),
    Buffer.from(nameAndContent[1])
  ));

describe(InputFileResolver.name, () => {
  let globStub: sinon.SinonStub;
  let sut: InputFileResolver;
  let reporterMock: Mock<BroadcastReporter>;
  let childProcessExecStub: sinon.SinonStub;
  let readFileStub: sinon.SinonStub;

  beforeEach(() => {
    reporterMock = mock(BroadcastReporter);
    globStub = sinon.stub(fileUtils, 'glob');
    readFileStub = sinon.stub(fsAsPromised, 'readFile')
      .withArgs(sinon.match.string).resolves(Buffer.from('')) // fallback
      .withArgs(sinon.match.string).resolves(Buffer.from('')) // fallback
      .withArgs(sinon.match('file1')).resolves(Buffer.from('file 1 content'))
      .withArgs(sinon.match('file2')).resolves(Buffer.from('file 2 content'))
      .withArgs(sinon.match('file3')).resolves(Buffer.from('file 3 content'))
      .withArgs(sinon.match('mute1')).resolves(Buffer.from('mutate 1 content'))
      .withArgs(sinon.match('mute2')).resolves(Buffer.from('mutate 2 content'));
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
    `)
    });
    const result = await sut.resolve();
    expect(childProcessExecStub).calledWith('git ls-files --others --exclude-standard --cached --exclude .stryker-tmp',
      { maxBuffer: 10 * 1000 * 1024 });
    expect(result.files.map(file => file.name)).deep.eq([path.resolve('file1.js'), path.resolve('foo/bar/baz.ts')]);
  });

  it('should reject if there is no `files` array and `git ls-files` command fails', () => {
    const expectedError = new Error('fatal: Not a git repository (or any of the parent directories): .git');
    childProcessExecStub.rejects(expectedError);
    return expect(createSut().resolve())
      .rejectedWith(`Cannot determine input files. Either specify a \`files\` array in your stryker configuration, or make sure "${process.cwd()
        }" is located inside a git repository. Inner error: ${
        errorToString(expectedError)
        }`);
  });

  it('should log a warning if no files were resolved', async () => {
    testInjector.options.files = [];
    sut = createSut();
    await sut.resolve();
    expect(testInjector.logger.warn).calledWith(sinon.match(`No files selected. Please make sure you either${os.EOL} (1) Run Stryker inside a Git repository`)
      .and(sinon.match('(2) Specify the \`files\` property in your Stryker configuration')));
  });

  it('should be able to handle deleted files reported by `git ls-files`', async () => {
    sut = createSut();
    childProcessExecStub.resolves({
      stdout: Buffer.from(`
      deleted/file.js
    `)
    });
    const error = fileNotFoundError();
    readFileStub.withArgs('deleted/file.js').rejects(error);
    const result = await sut.resolve();
    expect(result.files).lengthOf(0);
  });

  it('should be able to handle directories reported by `git ls-files` (submodules)', async () => {
    sut = createSut();
    childProcessExecStub.resolves({
      stdout: Buffer.from(`
      submoduleDir
    `)
    });
    const fileIsDirError = createIsDirError();
    readFileStub.withArgs('submoduleDir').rejects(fileIsDirError);
    const result = await sut.resolve();
    expect(result.files).lengthOf(0);
  });

  describe('with mutate file expressions', () => {

    it('should result in the expected mutate files', async () => {
      testInjector.options.mutate = ['mute*'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      sut = createSut();
      const result = await sut.resolve();
      expect(result.filesToMutate.map(_ => _.name)).to.deep.equal([
        path.resolve('/mute1.js'),
        path.resolve('/mute2.js')
      ]);
      expect(result.files.map(file => file.name)).to.deep.equal([
        path.resolve('/file1.js'),
        path.resolve('/mute1.js'),
        path.resolve('/file2.js'),
        path.resolve('/mute2.js'),
        path.resolve('/file3.js')]
      );
    });

    it('should only report a mutate file when it is included in the resolved files', async () => {
      testInjector.options.mutate = ['mute*'];
      testInjector.options.files = ['file1', 'mute1', 'file2', /*'mute2'*/ 'file3'];
      sut = createSut();
      const result = await sut.resolve();
      expect(result.filesToMutate.map(_ => _.name)).to.deep.equal([
        path.resolve('/mute1.js')
      ]);
    });

    it('should report OnAllSourceFilesRead', async () => {
      testInjector.options.mutate = ['mute*'];
      testInjector.options.files = ['file1', 'mute1', 'file2', 'mute2', 'file3'];
      sut = createSut();
      await sut.resolve();
      const expected: SourceFile[] = [
        { path: path.resolve('/file1.js'), content: 'file 1 content' },
        { path: path.resolve('/mute1.js'), content: 'mutate 1 content' },
        { path: path.resolve('/file2.js'), content: 'file 2 content' },
        { path: path.resolve('/mute2.js'), content: 'mutate 2 content' },
        { path: path.resolve('/file3.js'), content: 'file 3 content' }
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
        { path: path.resolve('/mute1.js'), content: 'mutate 1 content' },
        { path: path.resolve('/file2.js'), content: 'file 2 content' },
        { path: path.resolve('/mute2.js'), content: 'mutate 2 content' },
        { path: path.resolve('/file3.js'), content: 'file 3 content' }
      ];
      expected.forEach(sourceFile => expect(reporterMock.onSourceFileRead).calledWith(sourceFile));
    });
  });

  describe('without mutate files', () => {

    beforeEach(() => {
      testInjector.options.files = ['file1', 'mute1'];
      sut = createSut();
    });

    it('should warn about dry-run', async () => {
      await sut.resolve();
      expect(testInjector.logger.warn).calledWith(sinon.match('No files marked to be mutated, Stryker will perform a dry-run without actually mutating anything.'));
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
      expect(result.files.map(m => m.name.substr(m.name.length - 5))).to.deep.equal(['file1', 'file2']);
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
      const config = new Config();
      testInjector.options.files = config.files;
      testInjector.options.mutate = config.mutate;
      sut = createSut();
      childProcessExecStub.resolves({ stdout: Buffer.from(`src/foobar.js`) });
      globStub.withArgs(config.mutate[0]).returns(['src/foobar.js']);
      await sut.resolve();
      expect(testInjector.logger.warn).not.called;
    });
  });

  it('should reject when a globbing expression results in a reject', () => {
    testInjector.options.files = ['fileError', 'fileError'];
    testInjector.options.mutate = ['file1'];
    sut = createSut();
    const expectedError = new Error('ERROR: something went wrong');
    globStub.withArgs('fileError').rejects(expectedError);
    return expect(sut.resolve()).rejectedWith(expectedError);
  });

  describe('when excluding files with "!"', () => {

    it('should exclude the files that were previously included', async () => {
      testInjector.options.files = ['file2', 'file1', '!file2'];
      const sut = createSut();
      const result = await sut.resolve();
      assertFilesEqual(result.files, files(['/file1.js', 'file 1 content']));
    });

    it('should exclude the files that were previously with a wild card', async () => {
      testInjector.options.files = ['file*', '!file2'];
      const sut = createSut();
      const result = await sut.resolve();
      assertFilesEqual(result.files, files(['/file1.js', 'file 1 content'], ['/file3.js', 'file 3 content']));
    });

    it('should not exclude files when the globbing expression results in an empty array', async () => {
      testInjector.options.files = ['file2', '!does/not/exist'];
      const sut = createSut();
      const result = await sut.resolve();
      assertFilesEqual(result.files, files(['/file2.js', 'file 2 content']));
    });
  });

  describe('when provided duplicate files', () => {

    it('should deduplicate files that occur more than once', async () => {
      testInjector.options.files = ['file2', 'file2'];
      const result = await createSut().resolve();
      assertFilesEqual(result.files, files(['/file2.js', 'file 2 content']));
    });

    it('should deduplicate files that previously occurred in a wildcard expression', async () => {
      testInjector.options.files = ['file*', 'file2'];
      const result = await createSut().resolve();
      assertFilesEqual(result.files, files(['/file1.js', 'file 1 content'], ['/file2.js', 'file 2 content'], ['/file3.js', 'file 3 content']));
    });

    it('should order files by expression order', async () => {
      testInjector.options.files = ['file2', 'file*'];
      const result = await createSut().resolve();
      assertFilesEqual(result.files, files(['/file2.js', 'file 2 content'], ['/file1.js', 'file 1 content'], ['/file3.js', 'file 3 content']));
    });
  });

  function assertFilesEqual(actual: ReadonlyArray<File>, expected: ReadonlyArray<File>) {
    expect(actual).lengthOf(expected.length);
    for (const index in actual) {
      expect(actual[index].name).eq(expected[index].name);
      expect(actual[index].textContent).eq(expected[index].textContent);
    }
  }

  function createSut() {
    return testInjector.injector
      .provideValue(coreTokens.reporter, reporterMock)
      .injectClass(InputFileResolver);
  }
});
