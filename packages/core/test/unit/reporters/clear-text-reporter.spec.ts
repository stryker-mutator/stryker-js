import os from 'os';

import { MutantStatus, schema } from '@stryker-mutator/api/core';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import chalk from 'chalk';

import { calculateMutationTestMetrics } from 'mutation-testing-metrics';

import { ClearTextReporter } from '../../../src/reporters/clear-text-reporter';

describe(ClearTextReporter.name, () => {
  let sut: ClearTextReporter;
  let stdoutStub: sinon.SinonStub;

  beforeEach(() => {
    stdoutStub = sinon.stub(process.stdout, 'write');
    sut = testInjector.injector.injectClass(ClearTextReporter);
  });

  describe(ClearTextReporter.prototype.onMutationTestReportReady.name, () => {
    let report: schema.MutationTestResult;
    let mutant: schema.MutantResult;

    beforeEach(() => {
      mutant = factory.mutationTestReportSchemaMutantResult({
        id: '1',
        location: { start: { line: 2, column: 1 }, end: { line: 2, column: 4 } },
        replacement: 'bar',
        mutatorName: 'Math',
      });
      report = factory.mutationTestReportSchemaMutationTestResult({
        files: {
          'foo.js': factory.mutationTestReportSchemaFileResult({
            source: '\nfoo\n',
            mutants: [mutant],
          }),
        },
        testFiles: {
          'foo.spec.js': factory.mutationTestReportSchemaTestFile({
            tests: [
              factory.mutationTestReportSchemaTestDefinition({ id: '1', name: 'foo should be bar' }),
              factory.mutationTestReportSchemaTestDefinition({ id: '2', name: 'bar should be baz' }),
              factory.mutationTestReportSchemaTestDefinition({ id: '3', name: 'baz should be qux' }),
              factory.mutationTestReportSchemaTestDefinition({ id: '4', name: 'qux should be quux' }),
              factory.mutationTestReportSchemaTestDefinition({ id: '5', name: 'quux should be corge' }),
            ],
          }),
        },
      });
    });

    it('should report the clear text table with correct values', () => {
      testInjector.options.coverageAnalysis = 'all';

      act({
        files: {
          'src/file.js': {
            language: 'js',
            mutants: [
              {
                id: '1',
                location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
                mutatorName: 'Block',
                replacement: '{}',
                status: MutantStatus.Killed,
              },
            ],
            source: 'console.log("hello world!")',
          },
        },
        schemaVersion: '1.0',
        thresholds: factory.mutationScoreThresholds({}),
      });

      const serializedTable: string = stdoutStub.getCalls().pop()!.args[0];
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
      sut = testInjector.injector.injectClass(ClearTextReporter); // recreate, `allowConsoleColors` is read in constructor

      act({
        files: {},
        schemaVersion: '1.0',
        thresholds: factory.mutationScoreThresholds({}),
      });

      expect(chalk.level).to.eq(0);
    });

    it('should report a killed mutant to debug', async () => {
      mutant.status = MutantStatus.Killed;
      mutant.killedBy = ['1'];
      act(report);
      expect(testInjector.logger.debug).calledWithMatch(sinon.match('1. [Killed] Math'));
      expect(testInjector.logger.debug).calledWith(`${chalk.red('-   foo')}`);
      expect(testInjector.logger.debug).calledWith(`${chalk.green('+   bar')}`);
      expect(testInjector.logger.debug).calledWith('Killed by: foo should be bar');
    });

    it('should report a CompileError mutant to debug', async () => {
      mutant.status = MutantStatus.CompileError;
      mutant.statusReason = 'could not call bar of undefined';
      act(report);
      expect(testInjector.logger.debug).calledWithMatch(sinon.match('1. [CompileError] Math'));
      expect(testInjector.logger.debug).calledWith(`${chalk.red('-   foo')}`);
      expect(testInjector.logger.debug).calledWith(`${chalk.green('+   bar')}`);
      expect(testInjector.logger.debug).calledWith('Error message: could not call bar of undefined');
    });

    it('should report a NoCoverage mutant to stdout', async () => {
      mutant.status = MutantStatus.NoCoverage;
      act(report);
      expect(stdoutStub).calledWithMatch(sinon.match('1. [NoCoverage] Math'));
      expect(stdoutStub).calledWith(`${chalk.red('-   foo')}${os.EOL}`);
      expect(stdoutStub).calledWith(`${chalk.green('+   bar')}${os.EOL}`);
    });

    it('should report a Survived mutant to stdout', async () => {
      mutant.status = MutantStatus.Survived;
      act(report);
      expect(stdoutStub).calledWithMatch(sinon.match('1. [Survived] Math'));
    });

    it('should report a Timeout mutant to stdout', async () => {
      mutant.status = MutantStatus.Timeout;
      act(report);
      expect(testInjector.logger.debug).calledWithMatch(sinon.match('1. [Timeout] Math'));
    });

    it('should report the tests ran for a Survived mutant to stdout for "perTest" coverage analysis', async () => {
      mutant.coveredBy = ['1', '2', '3'];
      mutant.status = MutantStatus.Survived;
      act(report);
      expect(stdoutStub).calledWithExactly(`Tests ran:${os.EOL}`);
      expect(stdoutStub).calledWithExactly(`    foo should be bar${os.EOL}`);
      expect(stdoutStub).calledWithExactly(`    bar should be baz${os.EOL}`);
      expect(stdoutStub).calledWithExactly(`    baz should be qux${os.EOL}`);
    });

    it('should report the max tests to log and however many more tests', async () => {
      testInjector.options.clearTextReporter.maxTestsToLog = 2;
      mutant.coveredBy = ['1', '2', '3'];
      mutant.status = MutantStatus.Survived;
      act(report);
      expect(stdoutStub).calledWithExactly(`Tests ran:${os.EOL}`);
      expect(stdoutStub).calledWithExactly(`    foo should be bar${os.EOL}`);
      expect(stdoutStub).calledWithExactly(`    bar should be baz${os.EOL}`);
      expect(stdoutStub).not.calledWithMatch(sinon.match('baz should be qux'));
      expect(stdoutStub).calledWithExactly(`  and 1 more test!${os.EOL}`);
    });

    it('should report that all tests have ran for a surviving mutant that is static', async () => {
      testInjector.options.clearTextReporter.maxTestsToLog = 2;
      mutant.static = true;
      mutant.status = MutantStatus.Survived;
      act(report);
      expect(stdoutStub).calledWithExactly(`Ran all tests for this mutant.${os.EOL}`);
    });

    it('should not log individual ran tests when logTests is not true', () => {
      testInjector.options.clearTextReporter.logTests = false;
      mutant.coveredBy = ['1', '2', '3'];
      mutant.status = MutantStatus.Survived;
      act(report);

      expect(process.stdout.write).not.calledWithMatch(sinon.match('Tests ran: '));
      expect(process.stdout.write).not.calledWithMatch(sinon.match('foo should be bar'));
      expect(process.stdout.write).not.calledWithMatch(sinon.match('Ran all tests for this mutant.'));
    });

    it('should correctly report tests run per mutant on avg', () => {
      mutant.testsCompleted = 4;
      report.files['foo.js'].mutants.push(factory.mutationTestReportSchemaMutantResult({ testsCompleted: 5 }));
      report.files['foo.js'].mutants.push(factory.mutationTestReportSchemaMutantResult({ testsCompleted: 1 }));
      act(report);

      expect(stdoutStub).calledWithExactly(`Ran 3.33 tests per mutant on average.${os.EOL}`);
    });

    it('should log source file location', () => {
      mutant.status = MutantStatus.Survived;
      mutant.location.start = { line: 4, column: 6 };
      act(report);

      expect(stdoutStub).to.have.been.calledWithMatch(sinon.match(`${chalk.cyan('foo.js')}:${chalk.yellow('4')}:${chalk.yellow('6')}`));
    });

    it('should log source file names without colored text when clearTextReporter is not false and allowConsoleColors is false', () => {
      testInjector.options.allowConsoleColors = false;
      mutant.status = MutantStatus.Survived;
      mutant.location.start = { line: 4, column: 6 };
      // Recreate, color setting is set in constructor
      sut = testInjector.injector.injectClass(ClearTextReporter);
      act(report);

      expect(stdoutStub).calledWithMatch(sinon.match('foo.js:4:6'));
    });
  });

  function act(report: schema.MutationTestResult) {
    sut.onMutationTestReportReady(report, calculateMutationTestMetrics(report));
  }
});
