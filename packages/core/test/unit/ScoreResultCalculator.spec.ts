import { MutantStatus, ScoreResult } from '@stryker-mutator/api/report';
import { testInjector } from '@stryker-mutator/test-helpers';
import { mutantResult, mutationScoreThresholds, scoreResult } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as path from 'path';
import * as sinon from 'sinon';
import ScoreResultCalculator from '../../src/ScoreResultCalculator';
import * as objectUtils from '../../src/utils/objectUtils';

describe(ScoreResultCalculator.name, () => {
  let sut: ScoreResultCalculator;

  beforeEach(() => {
    sut = testInjector.injector.injectClass(ScoreResultCalculator);
  });

  describe('calculate', () => {
    const extractNumbers = (actual: ScoreResult) => ({
      killed: actual.killed,
      noCoverage: actual.noCoverage,
      runtimeErrors: actual.runtimeErrors,
      survived: actual.survived,
      transpileErrors: actual.transpileErrors
    });

    it('should count results of a single file', () => {
      const fileName = path.join('base', 'something');
      const actual = sut.calculate([
        mutantResult({ status: MutantStatus.RuntimeError, sourceFilePath: fileName }),
        mutantResult({ status: MutantStatus.Killed, sourceFilePath: fileName }),
        mutantResult({ status: MutantStatus.TranspileError, sourceFilePath: fileName }),
        mutantResult({ status: MutantStatus.NoCoverage, sourceFilePath: fileName }),
        mutantResult({ status: MutantStatus.Survived, sourceFilePath: fileName }),
        mutantResult({ status: MutantStatus.Killed, sourceFilePath: fileName }),
        mutantResult({ status: MutantStatus.TimedOut, sourceFilePath: fileName })
      ]);
      expect(actual.name).to.eq('base');
      function assertNumbers(actual: ScoreResult) {
        expect(actual.killed, 'killed').to.eq(2);
        expect(actual.transpileErrors, 'transpileErrors').eq(1);
        expect(actual.runtimeErrors, 'runtimeErrors').eq(1);
        expect(actual.survived, 'survived').to.eq(1);
        expect(actual.noCoverage, 'noCoverage').to.eq(1);
        expect(actual.timedOut, 'timedOut').to.eq(1);
        expect(actual.totalCovered, 'totalCovered').to.eq(4);
        expect(actual.totalDetected, 'detected').to.eq(3);
        expect(actual.totalMutants, 'mutants').to.eq(7);
        expect(actual.totalValid, 'mutants').to.eq(5);
        expect(actual.totalInvalid, 'mutants').to.eq(2);
        expect(actual.totalUndetected, 'undetected').to.eq(2);
        expect(actual.mutationScoreBasedOnCoveredCode, 'percentageBasedOnCoveredCode').to.eq(75);
        expect(actual.mutationScore, 'mutationScore').to.eq(60);
      }
      assertNumbers(actual);
      assertNumbers(actual.childResults[0]);
    });

    it('should wrap a single result in its base directory', () => {
      const fileName = path.join('base', 'something');
      const actual = sut.calculate([mutantResult({ status: MutantStatus.RuntimeError, sourceFilePath: fileName })]);
      expect(actual.name).eq('base');
      expect(actual.childResults).lengthOf(1);
      expect(actual.childResults[0].name).eq('something');
    });

    it('should count results of multiple files', () => {
      const actual = sut.calculate([
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.NoCoverage }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.RuntimeError }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Circle.js'), status: MutantStatus.RuntimeError }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Circle.js'), status: MutantStatus.NoCoverage }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Circle.js'), status: MutantStatus.Survived }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Add.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Circle.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('karma-jasmine', 'src', 'Circle.js'), status: MutantStatus.Survived })
      ]);
      expect(actual.name).to.be.eq(path.join('karma-jasmine', 'src'));
      expect(extractNumbers(actual)).to.deep.eq({ killed: 6, runtimeErrors: 2, transpileErrors: 0, survived: 2, noCoverage: 2 });
      expect(actual.childResults).to.have.lengthOf(2);
      const addResult = actual.childResults.find(result => result.name === 'Add.js');
      const circleResult = actual.childResults.find(result => result.name === 'Circle.js');
      expect(addResult).to.be.ok;
      expect(circleResult).to.be.ok;
      if (addResult && circleResult) {
        expect(extractNumbers(addResult)).to.deep.eq({ killed: 5, runtimeErrors: 1, transpileErrors: 0, survived: 0, noCoverage: 1 });
        expect(extractNumbers(circleResult)).to.deep.eq({ killed: 1, survived: 2, runtimeErrors: 1, transpileErrors: 0, noCoverage: 1 });
      }
    });

    it('should group results per directory', () => {
      const actual = sut.calculate([
        mutantResult({ sourceFilePath: path.join('a', 'b', 'c', 'd', 'e.js'), status: MutantStatus.Killed }),
        mutantResult({ sourceFilePath: path.join('a', 'b', 'c', 'd', 'f.js'), status: MutantStatus.Survived }),
        mutantResult({ sourceFilePath: path.join('a', 'b', 'g.js'), status: MutantStatus.NoCoverage }),
        mutantResult({ sourceFilePath: path.join('a', 'b', 'h.js'), status: MutantStatus.RuntimeError })
      ]);
      expect(actual.name).to.eq(path.join('a', 'b'));
      expect(extractNumbers(actual)).to.deep.eq({ killed: 1, survived: 1, noCoverage: 1, runtimeErrors: 1, transpileErrors: 0 });
      expect(actual.childResults).to.have.lengthOf(3);
      expect(actual.childResults[0].name).to.eq(path.join('c', 'd'));
      expect(extractNumbers(actual.childResults[0])).to.deep.eq({ runtimeErrors: 0, transpileErrors: 0, noCoverage: 0, killed: 1, survived: 1 });
      expect(actual.childResults[0].childResults).to.have.lengthOf(2);
      const cdef = actual.childResults[0].childResults;
      expect(cdef[0].name).to.eq('e.js');
      expect(cdef[0].killed).to.eq(1);
      expect(cdef[1].name).to.eq('f.js');
      expect(cdef[1].survived).to.eq(1);
      expect(actual.childResults[1].name).to.eq('g.js');
      expect(actual.childResults[1].noCoverage).to.eq(1);
      expect(actual.childResults[2].name).to.eq('h.js');
      expect(actual.childResults[2].runtimeErrors).to.eq(1);
    });

    it('should order by directory/files first and than on alphabet', () => {
      const actual = sut.calculate([
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
      const actual = sut.calculate([]);
      expect(extractNumbers(actual)).to.deep.eq({ killed: 0, survived: 0, transpileErrors: 0, runtimeErrors: 0, noCoverage: 0 });
      expect(actual.childResults.length).to.be.eq(0);
      expect(actual.name).to.be.eq('');
      expect(actual.mutationScore).eq(100);
      expect(actual.mutationScoreBasedOnCoveredCode).eq(100);
    });

    it('should be able to handle children that do not start with the same path', () => {
      const actual = sut.calculate([mutantResult({ sourceFilePath: 'dir1/one' }), mutantResult({ sourceFilePath: 'dir2/two' })]);
      expect(actual.childResults.length).to.eq(2);
      expect(actual.name).to.eq('');
      expect(actual.childResults[0].name).to.eq('dir1/one');
      expect(actual.childResults[1].name).to.eq('dir2/two');
    });

    it('should be able to handle the same file name in two different directories', () => {
      const actual = sut.calculate([
        mutantResult({ sourceFilePath: path.join('a', 'b', 'x.js') }),
        mutantResult({ sourceFilePath: path.join('a', 'c', 'x.js') })
      ]);

      expect(actual.name).to.eq('a');
      expect(actual.childResults[0].name).to.equal(path.join('b', 'x.js'));
      expect(actual.childResults[1].name).to.equal(path.join('c', 'x.js'));
    });
  });

  describe('determineExitCode', () => {
    let sandbox: sinon.SinonSandbox;
    let setExitCodeStub: sinon.SinonStub;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      setExitCodeStub = sinon.stub(objectUtils, 'setExitCode');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should not set exit code = 1 if `threshold.break` is not configured', () => {
      sut.determineExitCode(scoreResult({ mutationScore: 0 }), mutationScoreThresholds({ break: null }));

      expect(setExitCodeStub).not.called;
      expect(testInjector.logger.debug).calledWith(
        "No breaking threshold configured. Won't fail the build no matter how low your mutation score is. Set `thresholds.break` to change this behavior."
      );
    });

    it('should not set exit code = 1 if `threshold.break` === score', () => {
      sut.determineExitCode(scoreResult({ mutationScore: 10.000001 }), mutationScoreThresholds({ break: 10.000001 }));
      expect(setExitCodeStub).not.called;
      expect(testInjector.logger.info).calledWith('Final mutation score of 10.00 is greater than or equal to break threshold 10.000001');
    });

    it('should set exit code = 1 if `threshold.break` > score', () => {
      sut.determineExitCode(scoreResult({ mutationScore: 56.6 }), mutationScoreThresholds({ break: 56.7 }));
      expect(setExitCodeStub).calledWith(1);
      expect(testInjector.logger.error).calledWith('Final mutation score 56.60 under breaking threshold 56.7, setting exit code to 1 (failure).');
      expect(testInjector.logger.info).calledWith('(improve mutation score or set `thresholds.break = null` to prevent this error in the future)');
    });
  });
});
