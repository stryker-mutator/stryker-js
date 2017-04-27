import { expect } from 'chai';
import logger from '../helpers/log4jsMock';
import * as path from 'path';
import { SourceFile, MutantStatus, MutantResult } from 'stryker-api/report';
import SourceFileTreeNode from '../../src/SourceFileTreeNode';
import HandlebarsModel from '../../src/HandlebarsModel';

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
      sut.addSourceFile(file('error/errors.js'));
    });

    describe('for existing files', () => {

      beforeEach(() => {
        sut.addMutantResult(mutantResult('some/path/file1.js', MutantStatus.Killed));
        sut.addMutantResult(mutantResult('some/other/path/file2.js', MutantStatus.Survived));
        sut.addMutantResult(mutantResult('some/path/file3.js', MutantStatus.TimedOut));
        sut.addMutantResult(mutantResult('blaat/file4.js', MutantStatus.NoCoverage));
        sut.addMutantResult(mutantResult('error/errors.js', MutantStatus.Error));
      });

      it('should add the results to the correct files', () =>
        expect(sut.toString()).to.eq('/\n.some\n..path\n.../file1.js [.]\n.../file3.js [T]\n..other\n...path\n..../file2.js [S]\n.blaat\n../file4.js [O]\n.error\n../errors.js [E]\n'));
    });

    describe('for not existing file', () => {
      let notExistingMutantResult: MutantResult;
      const mutantResultPath = path.normalize('some/path/that/does/not/exists');
      beforeEach(() => {
        notExistingMutantResult = mutantResult(mutantResultPath, MutantStatus.Killed);
        sut.addMutantResult(notExistingMutantResult);
      });

      it('should log a warning', () =>
        expect(logger.warn).to.have.been.calledWith(`Reported a mutant result for "${mutantResultPath}" but could not find source code for a file with that name. Skipping the result. Result was ${JSON.stringify(notExistingMutantResult)}.`));
    });

  });

  describe('calculateModel', () => {

    beforeEach(() => {
      sut.addSourceFile(file('left/file1.js'));
      sut.addSourceFile(file('left/file2.js'));
      sut.addSourceFile(file('right/file3.js'));
    });

    it('should count Killed and TimedOut as `detected` and Survived and NoCoverage as `undetected`', () => {
      sut.addMutantResult(mutantResult('left/file1.js', MutantStatus.Killed));
      sut.addMutantResult(mutantResult('left/file1.js', MutantStatus.Survived));
      sut.addMutantResult(mutantResult('left/file1.js', MutantStatus.TimedOut));
      sut.addMutantResult(mutantResult('left/file2.js', MutantStatus.Survived));
      sut.addMutantResult(mutantResult('left/file2.js', MutantStatus.NoCoverage));

      sut.calculateModel('');
      const actualModel = sut.model;

      expectModelToEqual(actualModel, {
        percentageBasedOnAllCode: 2 / 5 * 100,
        percentageBasedOnCoveredCode: 2 / 4 * 100,
        totalCoveredMutations: 4,
        totalErrors: 0,
        totalKilled: 1,
        totalTimedOut: 1,
        totalDetected: 2,
        totalMutations: 5,
        totalSurvived: 2,
        totalNoCoverage: 1,
        totalUndetected: 3
      });
    });

    it('should not count `errors` in scores', () => {
      sut.addMutantResult(mutantResult('left/file1.js', MutantStatus.Killed));
      sut.addMutantResult(mutantResult('left/file1.js', MutantStatus.Survived));
      sut.addMutantResult(mutantResult('left/file1.js', MutantStatus.TimedOut));
      sut.addMutantResult(mutantResult('left/file1.js', MutantStatus.Error));
      sut.addMutantResult(mutantResult('left/file2.js', MutantStatus.Survived));
      sut.addMutantResult(mutantResult('left/file2.js', MutantStatus.NoCoverage));
      sut.addMutantResult(mutantResult('left/file2.js', MutantStatus.Error));

      sut.calculateModel('');
      const actualModel = sut.model;

      expectModelToEqual(actualModel, {
        percentageBasedOnAllCode: 2 / 5 * 100,
        percentageBasedOnCoveredCode: 2 / 4 * 100,
        totalCoveredMutations: 4,
        totalErrors: 2,
        totalKilled: 1,
        totalMutations: 5,
        totalSurvived: 2,
        totalNoCoverage: 1,
        totalDetected: 2,
        totalUndetected: 3
      });
    });
  });

  function expectModelToEqual(actualModel: HandlebarsModel, expected: any) {
    for (let i in expected) {
      expect((actualModel as any)[i], `comparing ${i}`).to.be.eq(expected[i]);
    }
  }

  function file(thePath: string): SourceFile {
    return { path: path.normalize(thePath), content: '' };
  }

  function mutantResult(sourceFilePath: string, status: MutantStatus): MutantResult {
    return {
      sourceFilePath: path.normalize(sourceFilePath),
      status,
      mutatorName: '',
      mutatedLines: '',
      originalLines: '',
      replacement: '',
      location: { start: { line: 0, column: 3 }, end: { line: 0, column: 5 } },
      range: [1, 1],
      testsRan: []
    };
  }
});