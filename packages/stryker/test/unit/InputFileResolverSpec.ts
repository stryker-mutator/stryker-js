import { resolve } from 'path';
import { expect } from 'chai';
import { Logger } from 'log4js';
import { SourceFile } from 'stryker-api/report';
import InputFileResolver from '../../src/InputFileResolver';
import * as sinon from 'sinon';
import * as fileUtils from '../../src/utils/fileUtils';
import * as path from 'path';
import * as fs from 'mz/fs';
import { FileDescriptor, TextFile } from 'stryker-api/core';
import currentLogMock from '../helpers/log4jsMock';
import BroadcastReporter from '../../src/reporters/BroadcastReporter';
import { Mock, mock, textFile } from '../helpers/producers';

const files = (...namesWithContent: [string, string][]): TextFile[] =>
  namesWithContent.map((nameAndContent): TextFile => textFile({
    mutated: false,
    transpiled: true,
    name: path.resolve(nameAndContent[0]),
    content: nameAndContent[1]
  }));

describe('InputFileResolver', () => {
  let log: Mock<Logger>;
  let globStub: sinon.SinonStub;
  let sut: InputFileResolver;
  let reporter: Mock<BroadcastReporter>;

  beforeEach(() => {
    log = currentLogMock();
    reporter = mock(BroadcastReporter);
    globStub = sandbox.stub(fileUtils, 'glob');
    sandbox.stub(fs, 'readFile').resolves('') // fall back
      .withArgs(sinon.match('file1')).resolves('file 1 content')
      .withArgs(sinon.match('file2')).resolves('file 2 content')
      .withArgs(sinon.match('file3')).resolves('file 3 content')
      .withArgs(sinon.match('mute1')).resolves('mutate 1 content')
      .withArgs(sinon.match('mute2')).resolves('mutate 2 content');
    globStub.withArgs('mut*tion*').resolves(['/mute1.js', '/mute2.js']);
    globStub.withArgs('mutation1').resolves(['/mute1.js']);
    globStub.withArgs('mutation2').resolves(['/mute2.js']);
    globStub.withArgs('file1').resolves(['/file1.js']);
    globStub.withArgs('file2').resolves(['/file2.js']);
    globStub.withArgs('file3').resolves(['/file3.js']);
    globStub.withArgs('file*').resolves(['/file1.js', '/file2.js', '/file3.js']);
    globStub.resolves([]); // default
  });

  describe('with mutant file expressions which result in files which are included in result of all globbing files', () => {
    beforeEach(() => {
      sut = new InputFileResolver(['mut*tion*'], ['file1', 'mutation1', 'file2', 'mutation2', 'file3'], reporter);
    });

    it('should result in the expected input files', async () => {
      const results = await sut.resolve();
      expect(results.length).to.be.eq(5);
      expect(results.map(m => m.mutated)).to.deep.equal([false, true, false, true, false]);
      expect(results.map(m => m.name)).to.deep.equal([
        path.resolve('/file1.js'),
        path.resolve('/mute1.js'),
        path.resolve('/file2.js'),
        path.resolve('/mute2.js'),
        path.resolve('/file3.js')]
      );
    });

    it('should report OnAllSourceFilesRead', async () => {
      await sut.resolve();
      const expected: SourceFile[] = [
        { content: 'file 1 content', path: path.resolve('/file1.js') },
        { content: 'mutate 1 content', path: path.resolve('/mute1.js') },
        { content: 'file 2 content', path: path.resolve('/file2.js') },
        { content: 'mutate 2 content', path: path.resolve('/mute2.js') },
        { content: 'file 3 content', path: path.resolve('/file3.js') }
      ];
      expect(reporter.onAllSourceFilesRead).calledWith(expected);
    });

    it('should report OnSourceFileRead', async () => {
      await sut.resolve();
      const expected: SourceFile[] = [
        { content: 'file 1 content', path: path.resolve('/file1.js') },
        { content: 'mutate 1 content', path: path.resolve('/mute1.js') },
        { content: 'file 2 content', path: path.resolve('/file2.js') },
        { content: 'mutate 2 content', path: path.resolve('/mute2.js') },
        { content: 'file 3 content', path: path.resolve('/file3.js') }
      ];
      expected.forEach(sourceFile => expect(reporter.onSourceFileRead).calledWith(sourceFile));
    });
  });

  describe('when supplying an InputFileDescriptor without `pattern` property', () => {
    it('should result in an error', () => {
      expect(() => new InputFileResolver([], [<any>{ included: false, mutated: true }], reporter))
        .throws('File descriptor {"included":false,"mutated":true} is missing mandatory property \'pattern\'.');
    });
  });

  describe('without mutate property, but with mutated: true in files', () => {

    beforeEach(() => {
      sut = new InputFileResolver([], ['file1', { pattern: 'mutation1', included: false, mutated: true }], reporter);
    });

    it('should result in the expected input files', async () => {
      const results = await sut.resolve();
      expect(results).to.deep.equal([
        textFile({ included: true, mutated: false, name: resolve('/file1.js'), content: 'file 1 content' }),
        textFile({ included: false, mutated: true, name: resolve('/mute1.js'), content: 'mutate 1 content' })]);
    });

    it('should log that one file is about to be mutated', async () => {
      await sut.resolve();
      expect(log.info).to.have.been.calledWith('Found 1 of 2 file(s) to be mutated.');
    });
  });

  describe('without mutate property and without mutated: true in files', () => {

    beforeEach(() => {
      sut = new InputFileResolver([], ['file1', { pattern: 'mutation1', included: false, mutated: false }], reporter);
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
      const results = await sut.resolve();
      expect(results.map(m => m.name.substr(m.name.length - 5))).to.deep.equal(['file1', 'file2']);
    });
  });

  describe('when selecting files to mutate which are not included', () => {
    let results: FileDescriptor[];
    let error: any;
    beforeEach(() => {
      sut = new InputFileResolver(['mut*tion*'], ['file1'], reporter);
      return sut.resolve().then(r => results = r, e => error = e);
    });

    it('should reject the result', () => {
      expect(results).to.not.be.ok;
      expect(error.message).to.be.eq([
        `Could not find mutate file "${path.resolve('/mute1.js')}" in list of files.`,
        `Could not find mutate file "${path.resolve('/mute2.js')}" in list of files.`
      ].join(' '));
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

  describe('when a globbing expression results in a reject', () => {
    let results: FileDescriptor[];
    let actualError: any;
    let expectedError: Error;

    beforeEach(() => {
      sut = new InputFileResolver(['file1'], ['fileError', 'fileError'], reporter);
      expectedError = new Error('ERROR: something went wrong');
      globStub.withArgs('fileError').rejects(expectedError);
      return sut.resolve().then(r => results = r, e => actualError = e);
    });

    it('should reject the promise', () => {
      expect(results).to.not.be.ok;
      expect(actualError).to.deep.equal(expectedError);
    });
  });

  describe('when excluding files with "!"', () => {

    it('should exclude the files that were previously included', () => {
      return expect(new InputFileResolver([], ['file2', 'file1', '!file2'], reporter).resolve())
        .to.eventually.deep.equal(files(['/file1.js', 'file 1 content']));
    });

    it('should exclude the files that were previously with a wild card', () => {
      return expect(new InputFileResolver([], ['file*', '!file2'], reporter).resolve())
        .to.eventually.deep.equal(files(['/file1.js', 'file 1 content'], ['/file3.js', 'file 3 content']));
    });

    it('should not exclude files added using an input file descriptor', () => {
      return expect(new InputFileResolver([], ['file2', { pattern: '!file2' }], reporter).resolve())
        .to.eventually.deep.equal(files(['/file2.js', 'file 2 content']));
    });

    it('should not exclude files when the globbing expression results in an empty array', () => {
      return expect(new InputFileResolver([], ['file2', '!does/not/exist'], reporter).resolve())
        .to.eventually.deep.equal(files(['/file2.js', 'file 2 content']));
    });
  });

  describe('when provided duplicate files', () => {

    it('should deduplicate files that occur more than once', () => {
      return expect(new InputFileResolver([], ['file2', 'file2'], reporter).resolve())
        .to.eventually.deep.equal(files(['/file2.js', 'file 2 content']));
    });

    it('should deduplicate files that previously occurred in a wildcard expression', () => {
      return expect(new InputFileResolver([], ['file*', 'file2'], reporter).resolve())
        .to.eventually.deep.equal(files(['/file1.js', 'file 1 content'], ['/file2.js', 'file 2 content'], ['/file3.js', 'file 3 content']));
    });

    it('should order files by expression order', () => {
      return expect(new InputFileResolver([], ['file2', 'file*'], reporter).resolve())
        .eventually.deep.equal(files(['/file2.js', 'file 2 content'], ['/file1.js', 'file 1 content'], ['/file3.js', 'file 3 content']));
    });
  });

  describe('with url as file pattern', () => {
    it('should pass through the web urls without globbing', () => {
      return new InputFileResolver([], ['http://www', { pattern: 'https://ok' }], reporter)
        .resolve()
        .then(() => expect(fileUtils.glob).to.not.have.been.called);
    });

    it('should fail when web url is in the mutated array', () => {
      expect(() => new InputFileResolver(['http://www'], ['http://www'], reporter))
        .throws('Cannot mutate web url "http://www".');
    });

    it('should fail when web url is to be mutated', () => {
      expect(() => new InputFileResolver([], [{ pattern: 'http://www', mutated: true }], reporter))
        .throws('Cannot mutate web url "http://www".');
    });
  });
});