import { MutantResult, MutantStatus, mutationTestReportSchema } from '@stryker-mutator/api/report';
import { TEST_INJECTOR } from '@stryker-mutator/test-helpers';
import { MUTANT_RESULT, MUTATION_SCORE_THRESHOLDS } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import chalk from 'chalk';
import * as os from 'os';
import * as sinon from 'sinon';
import ClearTextReporter from '../../../src/reporters/ClearTextReporter';

const colorizeFileAndPosition = (sourceFilePath: string, line: number, column: number) => {
  return [
    chalk.cyan(sourceFilePath),
    chalk.yellow(`${line}`),
    chalk.yellow(`${column}`),
  ].join(':');
};

describe(ClearTextReporter.name, () => {
  let sut: ClearTextReporter;
  let stdoutStub: sinon.SinonStub;

  beforeEach(() => {
    stdoutStub = sinon.stub(process.stdout, 'write');
    sut = TEST_INJECTOR.injector.injectClass(ClearTextReporter);
  });

  describe('onMutationTestReportReady', () => {

    it('should report the clear text table with correct values', () => {
      TEST_INJECTOR.options.coverageAnalysis = 'all';
      sut = TEST_INJECTOR.injector.injectClass(ClearTextReporter);

      sut.onMutationTestReportReady({
        files: {
          'src/file.js': {
            language: 'js',
            mutants: [
              {
                id: '1',
                location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
                mutatorName: 'Block',
                replacement: '{}',
                status: mutationTestReportSchema.MutantStatus.Killed
              }
            ],
            source: 'console.log("hello world!")'
          }
        },
        schemaVersion: '1.0',
        thresholds: MUTATION_SCORE_THRESHOLDS({})
      });

      const serializedTable: string = stdoutStub.getCall(0).args[0];
      const rows = serializedTable.split(os.EOL);
      expect(rows).to.deep.eq([
        '----------|---------|----------|-----------|------------|----------|---------|',
        'File      | % score | # killed | # timeout | # survived | # no cov | # error |',
        '----------|---------|----------|-----------|------------|----------|---------|',
        `All files |${chalk.green('  100.00 ')}|        1 |         0 |          0 |        0 |       0 |`,
        ` file.js  |${chalk.green('  100.00 ')}|        1 |         0 |          0 |        0 |       0 |`,
        '----------|---------|----------|-----------|------------|----------|---------|',
        ''
      ]);
    });

    it('should not color score if `allowConsoleColors` config is false', () => {
      TEST_INJECTOR.options.allowConsoleColors = false;
      chalk.level = 1;

      sut = TEST_INJECTOR.injector.injectClass(ClearTextReporter);
      sut.onMutationTestReportReady({
        files: {},
        schemaVersion: '1.0',
        thresholds: MUTATION_SCORE_THRESHOLDS({})
      });

      expect(chalk.level).to.eq(0);
    });
  });

  describe('when coverageAnalysis is "all"', () => {
    beforeEach(() => {
      TEST_INJECTOR.options.coverageAnalysis = 'all';
      TEST_INJECTOR.options.clearTextReporter = { logTests: true };
    });

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
        sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage, MutantStatus.RuntimeError, MutantStatus.TranspileError));
      });

      it('should report on the survived mutant', () => {
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('1. [Survived] Math'));
        expect(process.stdout.write).to.have.been.calledWith(chalk.red('-   original line') + os.EOL);
        expect(process.stdout.write).to.have.been.calledWith(chalk.green('+   mutated line') + os.EOL);
      });

      it('should not log individual ran tests', () => {
        expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Tests ran:'));
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('Ran all tests for this mutant.'));
      });
    });

  });

  describe('when coverageAnalysis: "perTest"', () => {

    describe('onAllMutantsTested()', () => {

      it('should log source file names with colored text when clearTextReporter is not false', () => {
        TEST_INJECTOR.options.coverageAnalysis = 'perTest';

        sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match(colorizeFileAndPosition('sourceFile.ts', 1, 2)));
      });

      it('should log source file names without colored text when clearTextReporter is not false and allowConsoleColors is false', () => {
        TEST_INJECTOR.options.coverageAnalysis = 'perTest';
        TEST_INJECTOR.options.allowConsoleColors = false;
        // Recreate, color setting is set in constructor
        sut = TEST_INJECTOR.injector.injectClass(ClearTextReporter);

        sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match(`sourceFile.ts:1:2`));
      });

      it('should not log source file names with colored text when clearTextReporter is false', () => {
        TEST_INJECTOR.options.coverageAnalysis = 'perTest';

        sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

        expect(process.stdout.write).to.have.been.calledWithMatch(colorizeFileAndPosition('sourceFile.ts', 1, 2));
      });

      it('should not log individual ran tests when logTests is not true', () => {
        TEST_INJECTOR.options.coverageAnalysis = 'perTest';

        sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

        expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Tests ran: '));
        expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('    a test'));
        expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('    a second test'));
        expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('    a third test'));
        expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Ran all tests for this mutant.'));

      });

      it('should log individual ran tests when logTests is true', () => {
        TEST_INJECTOR.options.coverageAnalysis = 'perTest';
        TEST_INJECTOR.options.clearTextReporter = { logTests: true };

        sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('Tests ran: '));
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a test'));
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a second test'));
        expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a third test'));
        expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Ran all tests for this mutant.'));
      });

      describe('with fewer tests that may be logged', () => {
        it('should log fewer tests', () => {
          TEST_INJECTOR.options.coverageAnalysis = 'perTest';
          TEST_INJECTOR.options.clearTextReporter = { logTests: true, maxTestsToLog: 1 };

          sut.onAllMutantsTested(mutantResults(MutantStatus.Killed, MutantStatus.Survived, MutantStatus.TimedOut, MutantStatus.NoCoverage));

          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('Tests ran:'));
          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('    a test'));
          expect(process.stdout.write).to.have.been.calledWithMatch(sinon.match('  and 2 more tests!'));
          expect(process.stdout.write).to.not.have.been.calledWithMatch(sinon.match('Ran all tests for this mutant.'));
        });
      });

      describe('with more tests that may be logged', () => {
        it('should log all tests', () => {
          TEST_INJECTOR.options.coverageAnalysis = 'perTest';
          TEST_INJECTOR.options.clearTextReporter = { logTests: true, maxTestsToLog: 10 };

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
          TEST_INJECTOR.options.coverageAnalysis = 'perTest';
          TEST_INJECTOR.options.clearTextReporter = { logTests: true, maxTestsToLog: 3 };

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
          TEST_INJECTOR.options.coverageAnalysis = 'perTest';
          TEST_INJECTOR.options.clearTextReporter = { logTests: true, maxTestsToLog: 0 };

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

    beforeEach(() => TEST_INJECTOR.options.coverageAnalysis = 'off');

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
      const result: MutantResult = MUTANT_RESULT({
        location: { start: { line: 1, column: 2 }, end: { line: 3, column: 4 } },
        mutatedLines: 'mutated line',
        mutatorName: 'Math',
        originalLines: 'original line',
        range: [0, 0],
        replacement: '',
        sourceFilePath: 'sourceFile.ts',
        status,
        testsRan: ['a test', 'a second test', 'a third test']
      });
      return result;
    });
  }

});
