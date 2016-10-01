import SourceFileTreeNode from '../../src/SourceFileTreeNode';
import {expect} from 'chai';
import {SourceFile, MutantStatus, MutantResult} from 'stryker-api/report';
import logger from '../helpers/log4jsMock';
import * as path from 'path';

describe('SourceFileTreeNode', () => {
  let sut: SourceFileTreeNode;

  beforeEach(() => {
    sut = new SourceFileTreeNode('/');
  });

  describe('addSourceFile()', () => {
    describe('with one SourceFile "some/random/path/file1.js"', () => {

      beforeEach(() => {
        sut.addSourceFile(file('some/random/path/file1.js'));
      });
      it('should make a list of nodes with one leaf', () => {
        expect(sut.toString()).to.eq('/\n.some\n..random\n...path\n..../file1.js\n');
      });

      [
        { file: 'some/random/path/file2.js', expected: '/\n.some\n..random\n...path\n..../file1.js\n..../file2.js\n' },
        { file: 'some/other/path/file3.js', expected: '/\n.some\n..random\n...path\n..../file1.js\n..other\n...path\n..../file3.js\n' }
      ].forEach(test => {
        describe(`with one SourceFile "${test.file.replace(/\n/g, '\\n')}"`, () => {
          beforeEach(() => {
            sut.addSourceFile(file(test.file));
          });

          it(`should make a tree as: "${test.expected.replace(/\n/g, '\\n')}"`, () => {
            expect(sut.toString()).to.eq(test.expected);
          });
        });
      });
    });
  });

  describe('addMutantResult()', () => {

    beforeEach(() => {
      sut.addSourceFile(file('some/path/file1.js'));
      sut.addSourceFile(file('some/other/path/file2.js'));
      sut.addSourceFile(file('some/path/file3.js'));
      sut.addSourceFile(file('blaat/file4.js'));
    });

    describe('for existing files', () => {

      beforeEach(() => {
        sut.addMutantResult(mutantResult('some/path/file1.js', MutantStatus.KILLED));
        sut.addMutantResult(mutantResult('some/other/path/file2.js', MutantStatus.SURVIVED));
        sut.addMutantResult(mutantResult('some/path/file3.js', MutantStatus.TIMEDOUT));
        sut.addMutantResult(mutantResult('blaat/file4.js', MutantStatus.UNTESTED));
      });

      it('should add the results to the correct files', () => {
        expect(sut.toString()).to.eq('/\n.some\n..path\n.../file1.js [.]\n.../file3.js [T]\n..other\n...path\n..../file2.js [S]\n.blaat\n../file4.js [O]\n');
      });
    });

  });

  describe('for not existing file', () => {
    let notExistingMutantResult: MutantResult;
    const mutantResultPath = path.normalize('some/path/that/does/not/exits');
    beforeEach(() => {
      notExistingMutantResult = mutantResult(mutantResultPath, MutantStatus.KILLED);
      sut.addMutantResult(notExistingMutantResult);
    });

    it('should log a warning', () =>
      expect(logger.warn).to.have.been.calledWith(`Reported a mutant result for "${mutantResultPath}" but could not find source code for a file with that name. Skipping the result. Result was ${JSON.stringify(notExistingMutantResult)}.`));
  });

  function file(thePath: string): SourceFile {
    return { path: path.normalize(thePath), content: '' };
  }

  function mutantResult(sourceFilePath: string, status: MutantStatus): MutantResult {
    return { sourceFilePath: path.normalize(sourceFilePath), status, mutatorName: '', mutatedLines: '', originalLines: '', replacement: '', location: null, range: null, testsRan: [] };
  }
});