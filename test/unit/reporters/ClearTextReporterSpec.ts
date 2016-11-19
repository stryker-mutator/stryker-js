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

      beforeEach(() => {
        sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));
      });

      it('should log individual ran tests', () => {
        expect(process.stdout.write).to.have.been.calledWith('Tests ran: \n');
        expect(process.stdout.write).to.have.been.calledWith('    a test\n');
        expect(process.stdout.write).to.have.been.calledWith('    a second test\n');
        expect(process.stdout.write).to.not.have.been.calledWith('Ran all tests for this mutant.\n');
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
        expect(process.stdout.write).to.have.been.calledWith(`Ran 2.00 tests per mutant on average.\n`));
    });
  });


  function mutantResults(...status: MutantStatus[]): MutantResult[] {
    return status.map(status => {
      return {
        location: { start: { line: 1, column: 2 }, end: { line: 3, column: 4 } },
        range: null,
        mutatedLines: 'mutated line',
        mutatorName: 'Math',
        originalLines: 'original line',
        replacement: '',
        sourceFilePath: '',
        testsRan: ['a test', 'a second test'],
        status
      };
    });
  }

  afterEach(() => sandbox.restore());
});
