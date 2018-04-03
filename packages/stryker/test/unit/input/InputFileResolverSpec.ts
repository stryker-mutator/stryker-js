import * as path from 'path';
import { expect } from 'chai';
import * as fs from 'mz/fs';
import * as childProcess from 'mz/child_process';
import { Logger } from 'log4js';
import { File } from 'stryker-api/core';
import { SourceFile } from 'stryker-api/report';
import InputFileResolver from '../../../src/input/InputFileResolver';
import * as sinon from 'sinon';
import * as fileUtils from '../../../src/utils/fileUtils';
import currentLogMock from '../../helpers/log4jsMock';
import BroadcastReporter from '../../../src/reporters/BroadcastReporter';
import { Mock, mock } from '../../helpers/producers';
import { errorToString, normalizeWhiteSpaces } from '../../../src/utils/objectUtils';

const files = (...namesWithContent: [string, string][]): File[] =>
  namesWithContent.map((nameAndContent): File => new File(
    path.resolve(nameAndContent[0]),
    Buffer.from(nameAndContent[1])
  ));

describe('InputFileResolver', () => {
  let log: Mock<Logger>;
  let globStub: sinon.SinonStub;
  let sut: InputFileResolver;
  let reporter: Mock<BroadcastReporter>;
  let childProcessExecStub: sinon.SinonStub;
  let readFileStub: sinon.SinonStub;

  beforeEach(() => {
    log = currentLogMock();
    reporter = mock(BroadcastReporter);
    globStub = sandbox.stub(fileUtils, 'glob');
    readFileStub = sandbox.stub(fs, 'readFile')
      .withArgs(sinon.match.string).resolves(new Buffer(0)) // fallback
      .withArgs(sinon.match.string).resolves(new Buffer(0)) // fallback
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
    childProcessExecStub = sandbox.stub(childProcess, 'exec');
  });

  it('should use git to identify files if files array is missing', async () => {
    sut = new InputFileResolver([], undefined, reporter);
    childProcessExecStub.resolves([Buffer.from(`
    file1.js
    foo/bar/baz.ts
    `)]);
    const result = await sut.resolve();
    expect(childProcessExecStub).calledWith('git ls-files --others --exclude-standard --cached',
      { maxBuffer: 10 * 1000 * 1024 });
    expect(result.files.map(file => file.name)).deep.eq([path.resolve('file1.js'), path.resolve('foo/bar/baz.ts')]);
  });

  it('should reject if there is no `files` array and `git ls-files` command fails', () => {
    const expectedError = new Error('fatal: Not a git repository (or any of the parent directories): .git');
    childProcessExecStub.rejects(expectedError);
    return expect(new InputFileResolver([], undefined, reporter).resolve())
      .rejectedWith(`Cannot determine input files. Either specify a \`files\` array in your stryker configuration, or make sure "${process.cwd()
        }" is located inside a git repository. Inner error: ${
        errorToString(expectedError)
        }`);
  });

  it('should log a warning if no files were resolved', async () => {
    sut = new InputFileResolver([], [], reporter);
    await sut.resolve();
    expect(log.warn).calledWith(sinon.match('No files selected. Please make sure you either run stryker a git repository context'));
    expect(log.warn).calledWith(sinon.match('or specify the \`files\` property in your stryker config'));
  });

  it('should be able to handled deleted files reported by `git ls-files`', async () => {
    sut = new InputFileResolver([], undefined, reporter);
    childProcessExecStub.resolves([Buffer.from(`
      deleted/file.js
    `)]);
    const fileNotFoundError: NodeJS.ErrnoException = new Error('');
    fileNotFoundError.code = 'ENOENT';
    readFileStub.withArgs('deleted/file.js').rejects(fileNotFoundError);
    const result = await sut.resolve();
    expect(result.files).lengthOf(0);
  });

  describe('with mutate file expressions', () => {

    it('should result in the expected mutate files', async () => {
      sut = new InputFileResolver(['mute*'], ['file1', 'mute1', 'file2', 'mute2', 'file3'], reporter);
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
      sut = new InputFileResolver(['mute*'], ['file1', 'mute1', 'file2', /*'mute2'*/ 'file3'], reporter);
      const result = await sut.resolve();
      expect(result.filesToMutate.map(_ => _.name)).to.deep.equal([
        path.resolve('/mute1.js')
      ]);
    });

    it('should report OnAllSourceFilesRead', async () => {
      sut = new InputFileResolver(['mute*'], ['file1', 'mute1', 'file2', 'mute2', 'file3'], reporter);
      await sut.resolve();
      const expected: SourceFile[] = [
        { path: path.resolve('/file1.js'), content: 'file 1 content' },
        { path: path.resolve('/mute1.js'), content: 'mutate 1 content' },
        { path: path.resolve('/file2.js'), content: 'file 2 content' },
        { path: path.resolve('/mute2.js'), content: 'mutate 2 content' },
        { path: path.resolve('/file3.js'), content: 'file 3 content' }
      ];
      expect(reporter.onAllSourceFilesRead).calledWith(expected);
    });

    it('should report OnSourceFileRead', async () => {
      sut = new InputFileResolver(['mute*'], ['file1', 'mute1', 'file2', 'mute2', 'file3'], reporter);
      await sut.resolve();
      const expected: SourceFile[] = [
        { path: path.resolve('/file1.js'), content: 'file 1 content' },
        { path: path.resolve('/mute1.js'), content: 'mutate 1 content' },
        { path: path.resolve('/file2.js'), content: 'file 2 content' },
        { path: path.resolve('/mute2.js'), content: 'mutate 2 content' },
        { path: path.resolve('/file3.js'), content: 'file 3 content' }
      ];
      expected.forEach(sourceFile => expect(reporter.onSourceFileRead).calledWith(sourceFile));
    });
  });

  describe('without mutate files', () => {

    beforeEach(() => {
      sut = new InputFileResolver([], ['file1', 'mute1'], reporter);
    });

    it('should warn about dry-run', async () => {
      await sut.resolve();
      expect(log.warn).to.have.been.calledWith('No files marked to be mutated, stryker will perform a dry-run without actually mutating anything.');
    });
  });

  describe('with file expressions that resolve in different order', () => {
    beforeEach(() => {
      sut = new InputFileResolver([], ['fileWhichResolvesLast', 'fileWhichResolvesFirst'], reporter);
      globStub.withArgs('fileWhichResolvesLast').resolves(['file1']);
      globStub.withArgs('fileWhichResolvesFirst').resolves(['file2']);
    });

    it('should retain original glob order', async () => {
      const result = await sut.resolve();
      expect(result.files.map(m => m.name.substr(m.name.length - 5))).to.deep.equal(['file1', 'file2']);
    });
  });

  describe('with file expressions in the old `InputFileDescriptor` syntax', () => {
    let patternFile1: any;
    let patternFile3: any;

    beforeEach(() => {
      patternFile1 = { pattern: 'file1' };
      patternFile3 = { pattern: 'file3' };

      sut = new InputFileResolver([], [patternFile1, 'file2', patternFile3], reporter);
    });

    it('it should log a warning', async () => {

      await sut.resolve();
      const inputFileDescriptors = JSON.stringify([patternFile1, patternFile3]);
      const patternNames = JSON.stringify([patternFile1.pattern, patternFile3.pattern]);
      expect(log.warn).calledWith(normalizeWhiteSpaces(`
      DEPRECATED: Using the \`InputFileDescriptor\` syntax to 
      select files is no longer supported. We'll assume: ${inputFileDescriptors} can be migrated 
      to ${patternNames} for this mutation run. Please move any files to mutate into the \`mutate\` 
      array (top level stryker option).
      
      You can fix this warning in 2 ways:
      1) If your project is under git version control, you can remove the "files" patterns all together. 
      Stryker can figure it out for you.
      2) If your project is not under git version control or you need ignored files in your sandbox, you can replace the 
      \`InputFileDescriptor\` syntax with strings (as done for this test run).`));
    });

    it('should resolve the patterns as normal files', async () => {
      const result = await sut.resolve();
      const actualFileNames = result.files.map(m => m.name);
      expect(actualFileNames).to.deep.equal(['/file1.js', '/file2.js', '/file3.js'].map(_ => path.resolve(_)));
    });
  });

  describe('when a globbing expression does not result in a result', () => {
    beforeEach(() => {
      sut = new InputFileResolver(['file1'], ['file1', 'notExists'], reporter);
    });

    it('should log a warning', async () => {
      await sut.resolve();
      expect(log.warn).to.have.been.calledWith('Globbing expression "notExists" did not result in any files.');
    });
  });

  it('should reject when a globbing expression results in a reject', () => {
    sut = new InputFileResolver(['file1'], ['fileError', 'fileError'], reporter);
    const expectedError = new Error('ERROR: something went wrong');
    globStub.withArgs('fileError').rejects(expectedError);
    return expect(sut.resolve()).rejectedWith(expectedError);
  });

  describe('when excluding files with "!"', () => {

    it('should exclude the files that were previously included', async () => {
      const result = await new InputFileResolver([], ['file2', 'file1', '!file2'], reporter).resolve();
      assertFilesEqual(result.files, files(['/file1.js', 'file 1 content']));
    });

    it('should exclude the files that were previously with a wild card', async () => {
      const result = await new InputFileResolver([], ['file*', '!file2'], reporter).resolve();
      assertFilesEqual(result.files, files(['/file1.js', 'file 1 content'], ['/file3.js', 'file 3 content']));
    });

    it('should not exclude files when the globbing expression results in an empty array', async () => {
      const result = await new InputFileResolver([], ['file2', '!does/not/exist'], reporter).resolve();
      assertFilesEqual(result.files, files(['/file2.js', 'file 2 content']));
    });
  });

  describe('when provided duplicate files', () => {

    it('should deduplicate files that occur more than once', async () => {
      const result = await new InputFileResolver([], ['file2', 'file2'], reporter).resolve();
      assertFilesEqual(result.files, files(['/file2.js', 'file 2 content']));
    });

    it('should deduplicate files that previously occurred in a wildcard expression', async () => {
      const result = await new InputFileResolver([], ['file*', 'file2'], reporter).resolve();
      assertFilesEqual(result.files, files(['/file1.js', 'file 1 content'], ['/file2.js', 'file 2 content'], ['/file3.js', 'file 3 content']));
    });

    it('should order files by expression order', async () => {
      const result = await new InputFileResolver([], ['file2', 'file*'], reporter).resolve();
      assertFilesEqual(result.files, files(['/file2.js', 'file 2 content'], ['/file1.js', 'file 1 content'], ['/file3.js', 'file 3 content']));
    });
  });

  function assertFilesEqual(actual: ReadonlyArray<File>, expected: ReadonlyArray<File>) {
    expect(actual).lengthOf(expected.length);
    for (let index in actual) {
      expect(actual[index].name).eq(expected[index].name);
      expect(actual[index].textContent).eq(expected[index].textContent);
    }
  }

});