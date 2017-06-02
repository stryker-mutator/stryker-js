import * as path from 'path';
import { expect } from 'chai';
import { MutantStatus, ScoreResult } from 'stryker-api/report';
import ScoreResultCalculator from '../../src/ScoreResultCalculator';
import { mutantResult } from '../helpers/producers';

describe('ScoreResult', () => {

  it('should count results of a single file', () => {
    const fileName = path.join('base', 'something');
    const actual = ScoreResultCalculator.calculate([
      mutantResult({ status: MutantStatus.Error, sourceFilePath: fileName }),
      mutantResult({ status: MutantStatus.Killed, sourceFilePath: fileName }),
      mutantResult({ status: MutantStatus.NoCoverage, sourceFilePath: fileName }),
      mutantResult({ status: MutantStatus.Survived, sourceFilePath: fileName }),
      mutantResult({ status: MutantStatus.Killed, sourceFilePath: fileName }),
      mutantResult({ status: MutantStatus.TimedOut, sourceFilePath: fileName }),
    ]);
    expect(actual.name).to.eq(fileName);
    expect(actual.killed, 'killed').to.eq(2);
    expect(actual.survived, 'survived').to.eq(1);
    expect(actual.noCoverage, 'noCoverage').to.eq(1);
    expect(actual.timedOut, 'timedOut').to.eq(1);
    expect(actual.totalCovered, 'totalCovered').to.eq(4);
    expect(actual.totalDetected, 'detected').to.eq(3);
    expect(actual.totalMutants, 'mutants').to.eq(5);
    expect(actual.totalUndetected, 'undetected').to.eq(2);
    expect(actual.mutationScoreBasedOnCoveredCode, 'percentageBasedOnCoveredCode').to.eq(75);
    expect(actual.mutationScore, 'mutationScore').to.eq(60);
    expect(actual.childResults).to.have.lengthOf(0);
  });

  it('should count results of multiple files', () => {
    const actual = ScoreResultCalculator.calculate(
      [
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.NoCoverage }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.Error }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Circle.js'), status: MutantStatus.Error }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Circle.js'), status: MutantStatus.NoCoverage }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Circle.js'), status: MutantStatus.Survived }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Circle.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Circle.js'), status: MutantStatus.Survived })
      ]);
    expect(actual.name).to.be.eq(path.join('karma-jasmine', 'src'));
    expect(totals(actual)).to.deep.eq({ killed: 6, errors: 2, survived: 2, noCoverage: 2 });
    expect(actual.childResults).to.have.lengthOf(2);
    const addResult = actual.childResults.find(result => result.name === 'Add.js');
    const circleResult = actual.childResults.find(result => result.name === 'Circle.js');
    expect(addResult).to.be.ok;
    expect(circleResult).to.be.ok;
    if (addResult && circleResult) {
      expect(totals(addResult)).to.deep.eq({ killed: 5, errors: 1, survived: 0, noCoverage: 1 });
      expect(totals(circleResult)).to.deep.eq({ killed: 1, survived: 2, errors: 1, noCoverage: 1 });
    }
  });

  it('should group results per directory', () => {
    const actual = ScoreResultCalculator.calculate(
      [
        mutantResult({ sourceFilePath: path.join('a', 'b', 'c', 'd', 'e.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('a', 'b', 'c', 'd', 'f.js'), status: MutantStatus.Survived }),
        mutantResult({ sourceFilePath: path.join('a', 'b', 'g.js'), status: MutantStatus.NoCoverage }),
        mutantResult({ sourceFilePath: path.join('a', 'b', 'h.js'), status: MutantStatus.Error }),
      ]);
    expect(actual.name).to.eq(path.join('a', 'b'));
    expect(totals(actual)).to.deep.eq({ killed: 1, survived: 1, noCoverage: 1, errors: 1 });
    expect(actual.childResults).to.have.lengthOf(3);
    expect(actual.childResults[0].name).to.eq(path.join('c', 'd'));
    expect(totals(actual.childResults[0])).to.deep.eq({ errors: 0, noCoverage: 0, killed: 1, survived: 1 });
    expect(actual.childResults[0].childResults).to.have.lengthOf(2);
    const cdef = actual.childResults[0].childResults;
    expect(cdef[0].name).to.eq('e.js');
    expect(cdef[0].killed).to.eq(1);
    expect(cdef[1].name).to.eq('f.js');
    expect(cdef[1].survived).to.eq(1);
    expect(actual.childResults[1].name).to.eq('g.js');
    expect(actual.childResults[1].noCoverage).to.eq(1);
    expect(actual.childResults[2].name).to.eq('h.js');
    expect(actual.childResults[2].errors).to.eq(1);
  });

  it('should order by directory/files first and than on alphabet', () => {
    const actual = ScoreResultCalculator.calculate(
      [
        mutantResult({ sourceFilePath: path.join('a', 'z', 'c.js') }),
        mutantResult({ sourceFilePath: path.join('a', 'z', 'a.js') }),
        mutantResult({ sourceFilePath: path.join('a', 'b.js') }),
        mutantResult({ sourceFilePath: path.join('a', 'a.js') }),
        mutantResult({ sourceFilePath: path.join('a', 'A.js') })
      ]);
    expect(actual.name).to.eq('a');
    expect(actual.childResults[0].name).to.eq('z');
    expect(actual.childResults[0].childResults[0].name).to.eq('a.js');
    expect(actual.childResults[0].childResults[1].name).to.eq('c.js');
    expect(actual.childResults[1].name).to.eq('a.js');
    expect(actual.childResults[2].name).to.eq('A.js');
    expect(actual.childResults[3].name).to.eq('b.js');
  });

  it('should be able to handle no results', () => {
    const actual = ScoreResultCalculator.calculate([]);
    expect(totals(actual)).to.deep.eq({ killed: 0, survived: 0, errors: 0, noCoverage: 0 });
    expect(actual.childResults.length).to.be.eq(0);
    expect(actual.name).to.be.eq('');
  });

  it('should be able to handle children that do not start with the same path', () => {
    const actual = ScoreResultCalculator.calculate([
      mutantResult({ sourceFilePath: 'dir1/one' }),
      mutantResult({ sourceFilePath: 'dir2/two' })
    ]);
    expect(actual.childResults.length).to.eq(2);
    expect(actual.name).to.eq('');
    expect(actual.childResults[0].name).to.eq('dir1/one');
    expect(actual.childResults[1].name).to.eq('dir2/two');
  });

  const totals = (actual: ScoreResult) => ({ killed: actual.killed, errors: actual.errors, survived: actual.survived, noCoverage: actual.noCoverage });
});