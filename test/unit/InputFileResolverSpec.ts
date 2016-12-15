import InputFileResolver from '../../src/InputFileResolver';
import * as sinon from 'sinon';
import * as fileUtils from '../../src/utils/fileUtils';
import * as path from 'path';
import { InputFile } from 'stryker-api/core';
import { expect } from 'chai';
import { normalize, resolve } from 'path';
import log from '../helpers/log4jsMock';

const fileDescriptors = (paths: Array<string>) => paths.map(p => ({ included: true, mutated: false, path: path.resolve(p) }));

describe('InputFileResolver', () => {

  let sandbox: sinon.SinonSandbox;
  let globStub: sinon.SinonStub;
  let sut: InputFileResolver;
  let results: InputFile[];

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    globStub = sandbox.stub(fileUtils, 'glob');
    sandbox.stub(console, 'log');

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
      sut = new InputFileResolver(['mut*tion*'], ['file1', 'mutation1', 'file2', 'mutation2', 'file3']);
    });

    describe('and resolve is called', () => {
      beforeEach(() => {
        return sut.resolve().then(r => results = r);
      });

      it('should result in the expected input files', () => {
        expect(results.length).to.be.eq(5);
        expect(results.map(m => m.mutated)).to.deep.equal([false, true, false, true, false]);
        expect(results.map(m => m.path.substr(m.path.length - 8))).to.deep.equal(['file1.js', 'mute1.js', 'file2.js', 'mute2.js', 'file3.js']);
      });
    });
  });

  describe('when supplying an InputFileDescriptor without `pattern` property', () => {
    let result: Error;
    beforeEach(() => {
      try {
        sut = new InputFileResolver(undefined, [<any>{ included: false, mutated: true }]);
      } catch (error) {
        result = error;
      }
    });

    it('should result in an error', () => expect(result.message).to.be.eq('File descriptor {"included":false,"mutated":true} is missing mandatory property \'pattern\'.'));
  });

  describe('without mutate property, but with mutated: true in files', () => {

    beforeEach(() => {
      sut = new InputFileResolver(undefined, ['file1', { pattern: 'mutation1', included: false, mutated: true }]);
      return sut.resolve().then(r => results = r);
    });

    it('should result in the expected input files', () => expect(results).to.deep.equal([
      { included: true, mutated: false, path: resolve('/file1.js') },
      { included: false, mutated: true, path: resolve('/mute1.js') }]));

    it('should log that one file is about to be mutated', () => expect(log.info).to.have.been.calledWith('Found 1 of 2 file(s) to be mutated.'));
  });

  describe('without mutate property and without mutated: true in files', () => {

    beforeEach(() => {
      sut = new InputFileResolver(undefined, ['file1', { pattern: 'mutation1', included: false, mutated: false }]);
      return sut.resolve().then(r => results = r);
    });

    it('should warn about dry-run', () => expect(log.warn).to.have.been.calledWith('No files marked to be mutated, stryker will perform a dry-run without actually mutating anything.'));
  });

  describe('with file expressions that resolve in different order', () => {
    let results: InputFile[];
    beforeEach(() => {
      let resolveFile1: (result: string[]) => void;
      let resolveFile2: (result: string[]) => void;
      sut = new InputFileResolver([], ['fileWhichResolvesLast', 'fileWichResolvesFirst']);
      globStub.withArgs('fileWhichResolvesLast').returns(new Promise(resolve => resolveFile1 = resolve));
      globStub.withArgs('fileWichResolvesFirst').returns(new Promise(resolve => resolveFile2 = resolve));
      let p = sut.resolve().then(r => results = r);
      resolveFile2(['file2']);
      resolveFile1(['file1']);
      return p;
    });

    it('should retain original glob order', () => {
      expect(results.map(m => m.path.substr(m.path.length - 5))).to.deep.equal(['file1', 'file2']);
    });
  });

  describe('when selecting files to mutate which are not included', () => {
    let results: InputFile[];
    let error: any;
    beforeEach(() => {
      sut = new InputFileResolver(['mut*tion*'], ['file1']);
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
      sut = new InputFileResolver(['file1'], ['file1', 'notExists']);
      return sut.resolve();
    });

    it('should log a warning', () => {
      expect(log.warn).to.have.been.calledWith('Globbing expression "notExists" did not result in any files.');
    });
  });

  describe('when a globbing expression results in a reject', () => {
    let results: InputFile[];
    let actualError: any;
    let expectedError: Error;

    beforeEach(() => {
      sut = new InputFileResolver(['file1'], ['fileError', 'fileError']);
      expectedError = new Error('ERROR: something went wrongue');
      globStub.withArgs('fileError').rejects(expectedError);
      return sut.resolve().then(r => results = r, e => actualError = e);
    });

    it('should reject the promise', () => {
      expect(results).to.not.be.ok;
      expect(actualError).to.deep.equal(expectedError);
    });
  });

  describe('when excluding files with "!"', () => {

    it('should exclude the files that were previously included', () =>
      expect(new InputFileResolver([], ['file2', 'file1', '!file2']).resolve()).to.eventually.deep.equal(fileDescriptors(['/file1.js'])));

    it('should exclude the files that were previously with a wild card', () =>
      expect(new InputFileResolver([], ['file*', '!file2']).resolve()).to.eventually.deep.equal(fileDescriptors(['/file1.js', '/file3.js'])));

    it('should not exclude files added using an input file descriptor', () =>
      expect(new InputFileResolver([], ['file2', { pattern: '!file2' }]).resolve()).to.eventually.deep.equal(fileDescriptors(['/file2.js'])));
  });

  describe('when provided duplicate files', () => {

    it('should deduplicate files that occur more than once', () => 
      expect(new InputFileResolver([], ['file2', 'file2']).resolve()).to.eventually.deep.equal(fileDescriptors(['/file2.js'])));
    
    it('should deduplicate files that previously occured in a wildcard expression', () => 
      expect(new InputFileResolver([], ['file*', 'file2']).resolve()).to.eventually.deep.equal(fileDescriptors(['/file1.js', '/file2.js', '/file3.js'])));
    
    it('should order files by expression order', () => 
      expect(new InputFileResolver([], ['file2', 'file*']).resolve()).to.eventually.deep.equal(fileDescriptors(['/file2.js', '/file1.js', '/file3.js'])));

  });

  afterEach(() => {
    sandbox.restore();
  });
});