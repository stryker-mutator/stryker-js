import { expect } from 'chai';
import * as sinon from 'sinon';
import * as chalk from 'chalk';
import { MutantStatus, MutantResult } from 'stryker-api/report';
import ClearTextReporter from '../../../src/reporters/ClearTextReporter';

describe('ClearTextReporter', function () {
  let sut: ClearTextReporter;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(process.stdout, 'write');
  });

  describe('when coverageAnalysis is "all"', () => {
    beforeEach(() => sut = new ClearTextReporter({ coverageAnalysis: 'all' }));

    describe('onAllMutantsTested() all mutants except error', () => {

      beforeEach(() => {
        sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));
      });
      it('should not report the error', () => {
        expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match(/error/));
      });
    });

    describe('onAllMutantsTested() with mutants of all kinds', () => {

      beforeEach(() => {
        sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage, MutantStatus.Error));
      });

      it('should report on the survived mutant', () => {
        expect(process.stdout.write).to.have.been.calledWith('Mutator: Math\n');
        expect(process.stdout.write).to.have.been.calledWith(chalk.red('-   original line') + '\n');
        expect(process.stdout.write).to.have.been.calledWith(chalk.green('+   mutated line') + '\n');
      });

      it('should not log individual ran tests', () => {
        expect(process.stdout.write).to.not.have.been.calledWith('Tests ran: \n');
        expect(process.stdout.write).to.have.been.calledWith('Ran all tests for this mutant.\n');
      });

      it('should make a correct calculation', () => {
        expect(process.stdout.write).to.have.been.calledWith(`5 total mutants.\n`);
        expect(process.stdout.write).to.have.been.calledWith(`1 mutant(s) caused an error and were therefore not accounted for in the mutation score.\n`);
        expect(process.stdout.write).to.have.been.calledWith(`2 mutants survived.\n`);
        expect(process.stdout.write).to.have.been.calledWith(`Mutation score based on all code: ${chalk.red('50.00%')}\n`);
        expect(process.stdout.write).to.have.been.calledWith(`Mutation score based on covered code: ${chalk.yellow('66.67%')}\n`);
      });
    });

  });

  describe('when coverageAnalysis: "perTest"', () => {

    beforeEach(() => sut = new ClearTextReporter({ coverageAnalysis: 'perTest' }));

    describe('onAllMutantsTested()', () => {

      it('should log individual ran tests', () => {
        sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));
        expect(process.stdout.write).to.have.been.calledWith('Tests ran: \n');
        expect(process.stdout.write).to.have.been.calledWith('    a test\n');
        expect(process.stdout.write).to.have.been.calledWith('    a second test\n');
        expect(process.stdout.write).to.have.been.calledWith('    a third test\n');
        expect(process.stdout.write).to.not.have.been.calledWith('Ran all tests for this mutant.\n');
      });

      describe('with less tests that may be logged', () => {
        it('should log less tests', () => {
          sut = new ClearTextReporter({ coverageAnalysis: 'perTest', clearTextReporter: { maxTestsToLog: 1 } });

          sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

          expect(process.stdout.write).to.have.been.calledWith('Tests ran: \n');
          expect(process.stdout.write).to.have.been.calledWith('    a test\n');
          expect(process.stdout.write).to.have.been.calledWith('  and 2 more tests!\n');
          expect(process.stdout.write).to.not.have.been.calledWith('Ran all tests for this mutant.\n');
        });
      });

      describe('with more tests that may be logged', () => {
        it('should log all tests', () => {
          sut = new ClearTextReporter({ coverageAnalysis: 'perTest', clearTextReporter: { maxTestsToLog: 10 } });

          sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

          expect(process.stdout.write).to.have.been.calledWith('Tests ran: \n');
          expect(process.stdout.write).to.have.been.calledWith('    a test\n');
          expect(process.stdout.write).to.have.been.calledWith('    a second test\n');
          expect(process.stdout.write).to.have.been.calledWith('    a third test\n');
          expect(process.stdout.write).to.not.have.been.calledWith('Ran all tests for this mutant.\n');
        });
      });

      describe('with the default amount of tests that may be logged', () => {
        it('should log all tests', () => {
          sut = new ClearTextReporter({ coverageAnalysis: 'perTest', clearTextReporter: { maxTestsToLog: 3 } });

          sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

          expect(process.stdout.write).to.have.been.calledWith('Tests ran: \n');
          expect(process.stdout.write).to.have.been.calledWith('    a test\n');
          expect(process.stdout.write).to.have.been.calledWith('    a second test\n');
          expect(process.stdout.write).to.have.been.calledWith('    a third test\n');
          expect(process.stdout.write).to.not.have.been.calledWith('Ran all tests for this mutant.\n');
        });
      });

      describe('with no tests that may be logged', () => {
        it('should not log a test', () => {
          sut = new ClearTextReporter({ coverageAnalysis: 'perTest', clearTextReporter: { maxTestsToLog: 0 } });

          sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

          expect(process.stdout.write).to.not.have.been.calledWith('Tests ran: \n');
          expect(process.stdout.write).to.not.have.been.calledWith('    a test\n');
          expect(process.stdout.write).to.not.have.been.calledWith('    a second test\n');
          expect(process.stdout.write).to.not.have.been.calledWith('    a third test\n');
          expect(process.stdout.write).to.not.have.been.calledWith('Ran all tests for this mutant.\n');
        });
      });
    });
  });

  describe('when coverageAnalysis: "off"', () => {

    beforeEach(() => sut = new ClearTextReporter({ coverageAnalysis: 'off' }));

    describe('onAllMutantsTested()', () => {
      beforeEach(() => {
        sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));
      });

      it('should not log individual ran tests', () => {
        expect(process.stdout.write).to.not.have.been.calledWith('Tests ran: \n');
        expect(process.stdout.write).to.have.been.calledWith('Ran all tests for this mutant.\n');
      });

      it('should indicate that mutation score based on covered code is not available', () =>
        expect(process.stdout.write).to.have.been.calledWith(`Mutation score based on covered code: n/a\n`));

      it('should report the average amount of tests ran', () =>
        expect(process.stdout.write).to.have.been.calledWith(`Ran 3.00 tests per mutant on average.\n`));
    });
  });


  function mutantResults(...status: MutantStatus[]): MutantResult[] {
    return status.map(status => {
      const result: MutantResult = {
        location: { start: { line: 1, column: 2 }, end: { line: 3, column: 4 } },
        range: [0, 0],
        mutatedLines: 'mutated line',
        mutatorName: 'Math',
        originalLines: 'original line',
        replacement: '',
        sourceFilePath: '',
        testsRan: ['a test', 'a second test', 'a third test'],
        status: status
      };
      return result;
    });
  }

  afterEach(() => sandbox.restore());
});
