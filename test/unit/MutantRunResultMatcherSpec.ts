import MutantRunResultMatcher from '../../src/MutantRunResultMatcher';
import * as sinon from 'sinon';
import {expect} from 'chai';

describe('MutantRunResultMatcher', () => {

  let sut: MutantRunResultMatcher;
  let mutants: any[];
  let runResultsByTestId: any[];

  beforeEach(() => {
    mutants = [];
    runResultsByTestId = [];
    sut = new MutantRunResultMatcher(mutants, runResultsByTestId);
  });

  describe('matchWithMutants()', () => {
    describe('with 2 mutants and 2 runResults', () => {
      let mutantOne: any, mutantTwo: any, runResultOne: any, runResultTwo: any;
      beforeEach(() => {
        mutantOne = { mutantOne: true, fileName: '1', location: { start: { line: 5, column: 6 }, end: { line: 5, column: 6 } }, addRunResultForTest: sinon.stub() };
        mutantTwo = { mutantTwo: true, fileName: '5',  location: { start: { line: 10, column: 0 }, end: { line: 10, column: 0 } }, addRunResultForTest: sinon.stub() };
        runResultOne = { testOne: true }; // Add some data to make them not equal to each other
        runResultTwo = { testTwo: true };
        mutants.push(mutantOne);
        mutants.push(mutantTwo);
        runResultsByTestId.push(runResultOne);
        runResultsByTestId.push(runResultTwo);
      });

      describe('without code coverage info', () => {

        beforeEach(() => {
          sut.matchWithMutants();
        });

        it('should add both tests to the mutants', () => {
          expect(mutantOne.addRunResultForTest).to.have.been.calledWith(0, runResultOne);
          expect(mutantOne.addRunResultForTest).to.have.been.calledWith(1, runResultTwo);
          expect(mutantTwo.addRunResultForTest).to.have.been.calledWith(0, runResultOne);
          expect(mutantTwo.addRunResultForTest).to.have.been.calledWith(1, runResultTwo);
        });
      });

      describe('without the tests having covered the mutants', () => {

        beforeEach(() => {
          runResultOne.coverage = {
            anOtherFile: {
              '1': { // covers but in wrong src file
                start: { line: 5, column: 0 },
                end: { line: 5, column: 8 }
              }
            },
            s: { '1': 1 }
          };
          runResultTwo.coverage = {
            1: {
              statementMap: {
                '1': {
                  start: { line: 3, column: 0 },
                  end: { line: 5, column: 10 }
                },
                '2': {
                  start: { line: 5, column: 0 },
                  end: { line: 5, column: 10 }
                },
                '3': { // Smallest statement that surrounds the mutant. Differs based on column number
                  start: { line: 5, column: 4 },
                  end: { line: 5, column: 8 }
                },
              },
              s: {
                '1': 1,
                '2': 1,
                '3': 0
              }
            },
            5: {
              statementMap: {
                '1': {
                  start: { line: 0, column: 1 },
                  end: { line: 10, column: 5 }
                },
                '2': { // Smallest  statement that surround the mutant. Differs based on line number
                  start: { line: 9, column: 1 },
                  end: { line: 10, column: 5 }
                },
                '3': {
                  start: { line: 10, column: 1 },
                  end: { line: 10, column: 5 }
                }
              },
              s: {
                '1': 1,
                '2': 0,
                '3': 1
              }
            }
          };
          sut.matchWithMutants();
        });

        it('should not have added the run results to the mutants', () => {
          expect(mutantOne.addRunResultForTest).to.not.have.been.called;
          expect(mutantTwo.addRunResultForTest).to.not.have.been.called;
        });
      });

      describe('with tests having covered the mutants', () => {

        beforeEach(() => {
          // mutantOne = { filename: '1', lineNumber: 5, columnNumber: 6, addRunResultForTest: sinon.stub() };
          // mutantTwo = { filename: '5', lineNumber: 10, columnNumber: 0, addRunResultForTest: sinon.stub() };
          runResultOne.coverage = {
            1: {
              statementMap: {
                '1': {
                  start: { line: 4, column: 0 },
                  end: { line: 6, column: 0 }
                }
              }, s: { '1': 1 }
            },
            5: {
              statementMap: {
                '1': {
                  start: { line: 10, column: 0 },
                  end: { line: 10, column: 0 }
                }
              }, s: { '1': 1 }
            }
          };
          runResultTwo.coverage = {
            1: {
              statementMap: {
                '1': {
                  start: { line: 4, column: 0 },
                  end: { line: 5, column: 6 }
                }
              }, s: { '1': 1 }
            }
          };
          sut.matchWithMutants();
        });

        it('should have added the run results to the mutants', () => {
          expect(mutantOne.addRunResultForTest).to.have.been.calledWith(0, runResultOne);
          expect(mutantOne.addRunResultForTest).to.have.been.calledWith(1, runResultTwo);
          expect(mutantTwo.addRunResultForTest).to.have.been.calledWith(0, runResultOne);
          expect(mutantTwo.addRunResultForTest).to.not.have.been.calledWith(1, runResultTwo);
        });
      });

    });
  });

});