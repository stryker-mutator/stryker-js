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
        mutantOne = { filename: '1', lineNumber: 5, columnNumber: 6, addRunResultForTest: sinon.stub() };
        mutantTwo = { filename: '5', lineNumber: 10, columnNumber: 0, addRunResultForTest: sinon.stub() };
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
          runResultOne.coverage = { anOtherFile: {} };
          runResultTwo.coverage = {
            1: {
              statementMap: {
                1: {
                  start: { line: 3, column: 0 },
                  end: { line: 5, column: 5 }
                },
                2: {
                  start: { line: 5, column: 7 },
                  end: { line: 5, column: 8 }
                },
                3: { // covers but not in 's' map
                  start: { line: 5, column: 0 },
                  end: { line: 5, column: 8 }
                }
              },
              s: {
                1: 1,
                2: 1,
                3: 0
              }
            },
            5: {
              statementMap: {
                1: {
                  start: { line: 10, column: 1 },
                  end: { line: 10, column: 5 }
                }
              },
              s: {
                1: 1
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

    });
  });

});