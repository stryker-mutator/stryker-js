import InputFileResolver from '../../src/InputFileResolver';
import * as sinon from 'sinon';
import * as fileUtils from '../../src/utils/fileUtils';
import {InputFile} from 'stryker-api/core';
import {expect} from 'chai';
import {normalize, resolve} from 'path';
import log from '../helpers/log4jsMock';

describe('InputFileResolver', () => {
  let sandbox: sinon.SinonSandbox;
  let globStub: sinon.SinonStub;
  let sut: InputFileResolver;
  let results: InputFile[];

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    globStub = sandbox.stub(fileUtils, 'glob');
    sandbox.stub(console, 'log');
  });

  describe('with mutant file expressions which result in files which are included in result of all globbing files', () => {
    beforeEach(() => {
      sut = new InputFileResolver(['mut*tion*'], ['file1', 'mutation1', 'file2', 'mutation2', 'file3']);
      globStub.withArgs('mut*tion*').returns(Promise.resolve(['/mute1.js', '/mute2.js']));
      globStub.withArgs('mutation1').returns(Promise.resolve(['/mute1.js']));
      globStub.withArgs('mutation2').returns(Promise.resolve(['/mute2.js']));
      globStub.withArgs('file1').returns(Promise.resolve(['/file1.js']));
      globStub.withArgs('file2').returns(Promise.resolve(['/file2.js']));
      globStub.withArgs('file3').returns(Promise.resolve(['/file3.js']));
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
      globStub.withArgs('file1').returns(Promise.resolve(['/file1.js']));
      globStub.withArgs('mutation1').returns(Promise.resolve(['/mutation1.js']));
      return sut.resolve().then(r => results = r);
    });

    it('should result in the expected input files', () => expect(results).to.deep.equal([
      { included: true, mutated: false, path: resolve('/file1.js') },
      { included: false, mutated: true, path: resolve('/mutation1.js') }]));

    it('should log that one file is about to be mutated', () => expect(log.info).to.have.been.calledWith('Found 1 file(s) to be mutated.'));
  });

  describe('without mutate property and without mutated: true in files', () => {

    beforeEach(() => {
      sut = new InputFileResolver(undefined, ['file1', { pattern: 'mutation1', included: false, mutated: false }]);
      globStub.withArgs('file1').returns(Promise.resolve(['/file1.js']));
      globStub.withArgs('mutation1').returns(Promise.resolve(['/mutation1.js']));
      return sut.resolve().then(r => results = r);
    });

    it('should warn about dry-run', () => expect(log.warn).to.have.been.calledWith('No files marked to be mutated, stryker will perform a dry-run without actually mutating anything.'));
  });

  describe('with file expressions that resolve in different order', () => {
    let results: InputFile[];
    beforeEach(() => {
      let resolveFile1: (result: string[]) => void;
      let resolveFile2: (result: string[]) => void;
      sut = new InputFileResolver([], ['file1', 'file2']);
      globStub.withArgs('file1').returns(new Promise(resolve => resolveFile1 = resolve));
      globStub.withArgs('file2').returns(new Promise(resolve => resolveFile2 = resolve));
      let p = sut.resolve().then(r => results = r);
      resolveFile2(['file2']);
      resolveFile1(['file1']);
      return p;
    });

    it('should retain original glob order', () => {
      expect(results.map(m => m.path.substr(m.path.length - 5))).to.deep.equal(['file1', 'file2']);
    });
  });

  describe('with mutant file expressions which result in files which are not included in result of all globbing files and resolve is called', () => {
    let results: InputFile[];
    let error: any;
    beforeEach(() => {
      sut = new InputFileResolver(['mut*tion*'], ['file1']);
      globStub.withArgs('mut*tion*').returns(Promise.resolve(['/mute1.js', '/mute2.js']));
      globStub.withArgs('file1').returns(Promise.resolve(['/file1.js']));
      return sut.resolve().then(r => results = r, e => error = e);
    });

    it('should reject the result', () => {
      let expectedFilesNames = ['/mute1.js', '/mute2.js'];
      fileUtils.normalize(expectedFilesNames);
      expect(results).to.not.be.ok;
      expect(error.message).to.be.eq([
        `Could not find mutate file "${expectedFilesNames[0]}" in list of files.`,
        `Could not find mutate file "${expectedFilesNames[1]}" in list of files.`
      ].join(' '));
    });
  });

  describe('when a globbing expression does not result in a result and resolve is called', () => {
    let results: InputFile[];
    beforeEach(() => {
      sut = new InputFileResolver(['file1'], ['file1', 'notExists']);
      globStub.withArgs('notExists').returns(Promise.resolve([]));
      globStub.withArgs('file1').returns(Promise.resolve(['file1.js']));
      return sut.resolve().then(r => results = r);
    });

    it('should log a warning', () => {
      expect(log.warn).to.have.been.calledWith('Globbing expression "notExists" did not result in any files.');
    });
  });

  describe('when a globbing expression results in a reject', () => {
    let results: InputFile[];
    let error: any;
    beforeEach(() => {
      sut = new InputFileResolver(['file1'], ['file2', 'file2']);
      globStub.withArgs('notExists').returns(Promise.resolve([]));
      globStub.withArgs('file1').returns(Promise.resolve(['file1.js']));
      globStub.withArgs('file2').returns(Promise.reject(['ERROR: something went wrongue']));
      return sut.resolve().then(r => results = r, e => error = e);
    });

    it('should reject the promise', () => {
      expect(results).to.not.be.ok;
      expect(error).to.deep.equal(['ERROR: something went wrongue']);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});