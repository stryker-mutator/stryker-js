import os from 'os';

import { MutantStatus, mutationTestReportSchema } from '@stryker-mutator/api/report';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import chalk from 'chalk';
import sinon from 'sinon';

import { ClearTextReporter } from '../../../src/reporters/clear-text-reporter';

describe(ClearTextReporter.name, () => {
  let sut: ClearTextReporter;
  let stdoutStub: sinon.SinonStub;

  beforeEach(() => {
    stdoutStub = sinon.stub(process.stdout, 'write');
    sut = testInjector.injector.injectClass(ClearTextReporter);
  });

  describe('onMutationTestReportReady', () => {
    it('should report the clear text table with correct values', () => {
      testInjector.options.coverageAnalysis = 'all';
      sut = testInjector.injector.injectClass(ClearTextReporter);

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
                status: mutationTestReportSchema.MutantStatus.Killed,
              },
            ],
            source: 'console.log("hello world!")',
          },
        },
        schemaVersion: '1.0',
        thresholds: factory.mutationScoreThresholds({}),
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
        '',
      ]);
    });

    it('should not color score if `allowConsoleColors` config is false', () => {
      testInjector.options.allowConsoleColors = false;
      chalk.level = 1;

      sut = testInjector.injector.injectClass(ClearTextReporter);
      sut.onMutationTestReportReady({
        files: {},
        schemaVersion: '1.0',
        thresholds: factory.mutationScoreThresholds({}),
      });

      expect(chalk.level).to.eq(0);
    });
  });

  describe('onAllMutantsTested', () => {
    it('should report a killed mutant to debug', async () => {
      sut.onAllMutantsTested([
        factory.killedMutantResult({ id: '1', mutatorName: 'Math', killedBy: 'foo should be bar', originalLines: 'foo', mutatedLines: 'bar' }),
      ]);
      expect(testInjector.logger.debug).calledWithMatch(sinon.match('1. [Killed] Math'));
      expect(testInjector.logger.debug).calledWith(`${chalk.red('-   foo')}`);
      expect(testInjector.logger.debug).calledWith(`${chalk.green('+   bar')}`);
      expect(testInjector.logger.debug).calledWith('Killed by: foo should be bar');
    });

    it('should report a transpileError mutant to debug', async () => {
      sut.onAllMutantsTested([
        factory.invalidMutantResult({
          id: '1',
          mutatorName: 'Math',
          errorMessage: 'could not call bar of undefined',
          status: MutantStatus.CompileError,
          originalLines: 'foo',
          mutatedLines: 'bar',
        }),
      ]);
      expect(testInjector.logger.debug).calledWithMatch(sinon.match('1. [CompileError] Math'));
      expect(testInjector.logger.debug).calledWith(`${chalk.red('-   foo')}`);
      expect(testInjector.logger.debug).calledWith(`${chalk.green('+   bar')}`);
      expect(testInjector.logger.debug).calledWith('Error message: could not call bar of undefined');
    });

    it('should report a NoCoverage mutant to stdout', async () => {
      sut.onAllMutantsTested([
        factory.undetectedMutantResult({
          id: '1',
          mutatorName: 'Math',
          status: MutantStatus.NoCoverage,
          originalLines: 'foo',
          mutatedLines: 'bar',
        }),
      ]);
      expect(stdoutStub).calledWithMatch(sinon.match('1. [NoCoverage] Math'));
      expect(stdoutStub).calledWith(`${chalk.red('-   foo')}${os.EOL}`);
      expect(stdoutStub).calledWith(`${chalk.green('+   bar')}${os.EOL}`);
    });

    it('should report a Survived mutant to stdout', async () => {
      sut.onAllMutantsTested([factory.undetectedMutantResult({ id: '42', mutatorName: 'Math', status: MutantStatus.Survived })]);
      expect(stdoutStub).calledWithMatch(sinon.match('42. [Survived] Math'));
    });

    it('should report a Timeout mutant to stdout', async () => {
      sut.onAllMutantsTested([factory.timeoutMutantResult({ id: '42', mutatorName: 'Math', status: MutantStatus.TimedOut })]);
      expect(testInjector.logger.debug).calledWithMatch(sinon.match('42. [TimedOut] Math'));
    });

    it('should report the tests ran for a Survived mutant to stdout for "perTest" coverage analysis', async () => {
      testInjector.options.coverageAnalysis = 'perTest';
      sut.onAllMutantsTested([
        factory.undetectedMutantResult({
          status: MutantStatus.Survived,
          testFilter: ['foo should be bar', 'baz should be qux', 'quux should be corge'],
        }),
      ]);
      expect(stdoutStub).calledWithExactly(`Tests ran:${os.EOL}`);
      expect(stdoutStub).calledWithExactly(`    foo should be bar${os.EOL}`);
      expect(stdoutStub).calledWithExactly(`    baz should be qux${os.EOL}`);
      expect(stdoutStub).calledWithExactly(`    quux should be corge${os.EOL}`);
    });

    it('should report the max tests to log and however many more tests', async () => {
      testInjector.options.coverageAnalysis = 'perTest';
      testInjector.options.clearTextReporter.maxTestsToLog = 2;
      sut.onAllMutantsTested([
        factory.undetectedMutantResult({
          status: MutantStatus.Survived,
          testFilter: ['foo should be bar', 'baz should be qux', 'quux should be corge'],
        }),
      ]);
      expect(stdoutStub).calledWithExactly(`Tests ran:${os.EOL}`);
      expect(stdoutStub).calledWithExactly(`    foo should be bar${os.EOL}`);
      expect(stdoutStub).calledWithExactly(`    baz should be qux${os.EOL}`);
      expect(stdoutStub).not.calledWithMatch(sinon.match('quux should be corge'));
      expect(stdoutStub).calledWithExactly(`  and 1 more test!${os.EOL}`);
    });

    it('should report that all tests have ran for a mutant when coverage analysis when testFilter is not defined', async () => {
      testInjector.options.coverageAnalysis = 'perTest';
      testInjector.options.clearTextReporter.maxTestsToLog = 2;
      sut.onAllMutantsTested([
        factory.undetectedMutantResult({
          status: MutantStatus.Survived,
          testFilter: undefined,
        }),
      ]);
      expect(stdoutStub).calledWithExactly(`Ran all tests for this mutant.${os.EOL}`);
    });

    it('should not log individual ran tests when logTests is not true', () => {
      testInjector.options.coverageAnalysis = 'perTest';
      testInjector.options.clearTextReporter.logTests = false;
      sut.onAllMutantsTested([factory.undetectedMutantResult({ status: MutantStatus.Survived, testFilter: ['foo should be bar'] })]);

      expect(process.stdout.write).not.calledWithMatch(sinon.match('Tests ran: '));
      expect(process.stdout.write).not.calledWithMatch(sinon.match('foo should be bar'));
      expect(process.stdout.write).not.calledWithMatch(sinon.match('Ran all tests for this mutant.'));
    });

    it('should report that all tests have ran for a mutant when coverage analysis = "all"', async () => {
      testInjector.options.coverageAnalysis = 'all';
      sut.onAllMutantsTested([factory.undetectedMutantResult({ status: MutantStatus.Survived, testFilter: [] })]);
      expect(stdoutStub).calledWithExactly(`Ran all tests for this mutant.${os.EOL}`);
    });

    it('should correctly report tests run per mutant on avg', () => {
      sut.onAllMutantsTested([
        factory.undetectedMutantResult({ nrOfTestsRan: 4 }),
        factory.killedMutantResult({ nrOfTestsRan: 5 }),
        factory.undetectedMutantResult({ nrOfTestsRan: 1 }),
      ]);
      expect(stdoutStub).calledWithExactly(`Ran 3.33 tests per mutant on average.${os.EOL}`);
    });

    it('should log source file location', () => {
      testInjector.options.coverageAnalysis = 'perTest';

      sut.onAllMutantsTested([factory.undetectedMutantResult({ fileName: 'foo.js', location: factory.location({ start: { line: 4, column: 6 } }) })]);

      expect(stdoutStub).to.have.been.calledWithMatch(sinon.match(`${chalk.cyan('foo.js')}:${chalk.yellow('4')}:${chalk.yellow('6')}`));
    });

    it('should log source file names without colored text when clearTextReporter is not false and allowConsoleColors is false', () => {
      testInjector.options.coverageAnalysis = 'perTest';
      testInjector.options.allowConsoleColors = false;
      // Recreate, color setting is set in constructor
      sut = testInjector.injector.injectClass(ClearTextReporter);

      sut.onAllMutantsTested([
        factory.killedMutantResult({ fileName: 'sourceFile.ts', location: factory.location({ start: { line: 1, column: 2 } }) }),
      ]);

      expect(testInjector.logger.debug).calledWithMatch(sinon.match('sourceFile.ts:1:2'));
    });
  });
});
