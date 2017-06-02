import * as os from 'os';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as chalk from 'chalk';
import * as _ from 'lodash';
import { MutantStatus, MutantResult } from 'stryker-api/report';
import ClearTextReporter from '../../../src/reporters/ClearTextReporter';
import { scoreResult } from '../../helpers/producers';

describe('ClearTextReporter', () => {
  let sut: ClearTextReporter;
  let sandbox: sinon.SinonSandbox;
  let stdoutStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    stdoutStub = sandbox.stub(process.stdout, 'write');
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
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('Mutator: Math'));
        expect(process.stdout.write).to.have.been.calledWith(chalk.red('-   original line') + os.EOL);
        expect(process.stdout.write).to.have.been.calledWith(chalk.green('+   mutated line') + os.EOL);
      });

      it('should not log individual ran tests', () => {
        expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Tests ran:'));
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('Ran all tests for this mutant.'));
      });
    });

    describe('onScoreCalculated', () => {
      it('should report the clear text table with correct values', () => {
        sut.onScoreCalculated(scoreResult({
          name: 'root',
          killed: 1,
          timedOut: 2,
          survived: 3,
          noCoverage: 4,
          errors: 5,
          mutationScore: 80,
          childResults: [scoreResult({
            name: 'child1',
            mutationScore: 60,
            childResults: [
              scoreResult({
                name: 'some/test/for/a/deep/file.js',
                mutationScore: 59.99
              })
            ]
          })]
        }));
        const serializedTable: string = stdoutStub.getCall(0).args[0];
        const rows = serializedTable.split(os.EOL);
        expect(rows).to.deep.eq([
          '-------------------------------|---------|----------|-----------|------------|----------|---------|',
          'File                           | % score | # killed | # timeout | # survived | # no cov | # error |',
          '-------------------------------|---------|----------|-----------|------------|----------|---------|',
          `All files                      |${chalk.green('   80.00 ')}|        1 |         2 |          3 |        4 |       5 |`,
          ` child1                        |${chalk.yellow('   60.00 ')}|        0 |         0 |          0 |        0 |       0 |`,
          `  some/test/for/a/deep/file.js |${chalk.red('   59.99 ')}|        0 |         0 |          0 |        0 |       0 |`,
          '-------------------------------|---------|----------|-----------|------------|----------|---------|',
          ''
        ]);
      });

      it('should grow columns widths based on value size', () => {
        sut.onScoreCalculated(scoreResult({
          killed: 1000000000
        }));
        const serializedTable: string = stdoutStub.getCall(0).args[0];
        const killedColumnValues = _.flatMap(serializedTable.split(os.EOL), row => row.split('|').filter((_, i) => i === 2));
        killedColumnValues.forEach(val => expect(val).to.have.lengthOf(12));
        expect(killedColumnValues[3]).to.eq(' 1000000000 ');
      });
    });

  });

  describe('when coverageAnalysis: "perTest"', () => {

    beforeEach(() => sut = new ClearTextReporter({ coverageAnalysis: 'perTest' }));

    describe('onAllMutantsTested()', () => {

      it('should log individual ran tests', () => {
        sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('Tests ran: '));
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a test'));
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a second test'));
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a third test'));
        expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Ran all tests for this mutant.'));
      });

      describe('with less tests that may be logged', () => {
        it('should log less tests', () => {
          sut = new ClearTextReporter({ coverageAnalysis: 'perTest', clearTextReporter: { maxTestsToLog: 1 } });

          sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('Tests ran:'));
          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a test'));
          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('  and 2 more tests!'));
          expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Ran all tests for this mutant.'));
        });
      });

      describe('with more tests that may be logged', () => {
        it('should log all tests', () => {
          sut = new ClearTextReporter({ coverageAnalysis: 'perTest', clearTextReporter: { maxTestsToLog: 10 } });

          sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('Tests ran:'));
          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a test'));
          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a second test'));
          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a third test'));
          expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Ran all tests for this mutant.'));
        });
      });

      describe('with the default amount of tests that may be logged', () => {
        it('should log all tests', () => {
          sut = new ClearTextReporter({ coverageAnalysis: 'perTest', clearTextReporter: { maxTestsToLog: 3 } });

          sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('Tests ran:'));
          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a test'));
          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a second test'));
          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a third test'));
          expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Ran all tests for this mutant.'));
        });
      });

      describe('with no tests that may be logged', () => {
        it('should not log a test', () => {
          sut = new ClearTextReporter({ coverageAnalysis: 'perTest', clearTextReporter: { maxTestsToLog: 0 } });

          sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

          expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Tests ran: \n'));
          expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('    a test\n'));
          expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('    a second test\n'));
          expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('    a third test\n'));
          expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Ran all tests for this mutant.\n'));
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
        expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Tests ran:'));
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('Ran all tests for this mutant.'));
      });

      it('should report the average amount of tests ran', () =>
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match(`Ran 3.00 tests per mutant on average.`)));
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
