import InputFileResolver from '../../src/InputFileResolver';
import * as sinon from 'sinon';
import * as fileUtils from '../../src/utils/fileUtils';
import {InputFile} from '../../src/api/core';
import {expect} from 'chai';
import {normalize} from 'path';

describe('InputFileResolver', () => {
  let sandbox: sinon.SinonSandbox;
  let globStub: sinon.SinonStub;
  let sut: InputFileResolver;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    globStub = sandbox.stub(fileUtils, 'glob');
    sandbox.stub(console, 'log');
  });

  describe('with mutant file expressions which result in files which are included in result of all globbing files', () => {
    let results: InputFile[];
    beforeEach(() => {
      sut = new InputFileResolver(['mut*tion*'], ['file1', 'mutation1', 'file2', 'mutation2', 'file3']);
      globStub.withArgs('mut*tion*').returns(Promise.resolve(['/mute1.js', '/mute2.js']))
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
        expect(results.map(m => m.shouldMutate)).to.deep.equal([false, true, false, true, false])
        expect(results.map(m => m.path.substr(m.path.length - 8))).to.deep.equal(['file1.js', 'mute1.js', 'file2.js', 'mute2.js', 'file3.js'])
      });
    });
  });

  describe('with mutant file expressions which result in files which are not included in result of all globbing files and resolve is called', () => {
    let results: InputFile[];
    let error: any;
    beforeEach(() => {
      sut = new InputFileResolver(['mut*tion*'], ['file1']);
      globStub.withArgs('mut*tion*').returns(Promise.resolve(['/mute1.js', '/mute2.js']))
      globStub.withArgs('file1').returns(Promise.resolve(['/file1.js']));
      return sut.resolve().then(r => results = r, e => error = e);
    });

    it('should reject the result', () => {
      let expectedFilesNames = ['/mute1.js', '/mute2.js'];
      fileUtils.normalize(expectedFilesNames)
      expect(results).to.not.be.ok;
      expect(error).to.deep.equal(
        [
          `Could not find mutate file "${expectedFilesNames[0]}" in list of files.`,
          `Could not find mutate file "${expectedFilesNames[1]}" in list of files.`
        ]);
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
      expect(console.log).to.have.been.calledWith(`WARNING: Globbing expression "notExists" did not result in any files.`)
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