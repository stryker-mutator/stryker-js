import os from 'os';

import { schema } from '@stryker-mutator/api/core';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import chalk from 'chalk';

import { calculateMutationTestMetrics } from 'mutation-testing-metrics';

import { ClearTextReporter } from '../../../src/reporters/clear-text-reporter.js';

describe(ClearTextReporter.name, () => {
  let sut: ClearTextReporter;
  let stdoutStub: sinon.SinonStub;

  beforeEach(() => {
    stdoutStub = sinon.stub(process.stdout, 'write');
    sut = testInjector.injector.injectClass(ClearTextReporter);
  });

  describe(ClearTextReporter.prototype.onMutationTestReportReady.name, () => {
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
                status: 'Killed',
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
        '----------|---------|----------|-----------|------------|----------|----------|',
        'File      | % score | # killed | # timeout | # survived | # no cov | # errors |',
        '----------|---------|----------|-----------|------------|----------|----------|',
        `All files |${chalk.green('  100.00 ')}|        1 |         0 |          0 |        0 |        0 |`,
        ` file.js  |${chalk.green('  100.00 ')}|        1 |         0 |          0 |        0 |        0 |`,
        '----------|---------|----------|-----------|------------|----------|----------|',
        '',
      ]);
    });

    it('should not report the clear text table when reportScoreTable is not true', () => {
      testInjector.options.clearTextReporter.reportScoreTable = false;

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
                status: 'Killed',
              },
            ],
            source: 'console.log("hello world!")',
          },
        },
        schemaVersion: '1.0',
        thresholds: factory.mutationScoreThresholds({}),
      });

      expect(stdoutStub).not.calledWithMatch(sinon.match('File      | % score | # killed | # timeout | # survived | # no cov | # errors |'));
    });

    it('should show emojis in table with enableConsoleEmojis flag', () => {
      testInjector.options.clearTextReporter.allowEmojis = true;

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
                status: 'Killed',
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
      expect(rows[1]).to.eq('File      | % score | ✅ killed | ⌛️ timeout | 👽 survived | 🙈 no cov | 💥 errors |');
    });

    it('should report the clear text table with full n/a values', () => {
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
                status: 'Ignored',
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
        '----------|---------|----------|-----------|------------|----------|----------|',
        'File      | % score | # killed | # timeout | # survived | # no cov | # errors |',
        '----------|---------|----------|-----------|------------|----------|----------|',
        `All files |${chalk.grey('     n/a ')}|        0 |         0 |          0 |        0 |        0 |`,
        ` file.js  |${chalk.grey('     n/a ')}|        0 |         0 |          0 |        0 |        0 |`,
        '----------|---------|----------|-----------|------------|----------|----------|',
        '',
      ]);
    });
    it('should report the clear text table with some n/a values', () => {
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
                status: 'Ignored',
              },
            ],
            source: 'console.log("hello world!")',
          },
          'src/file2.js': {
            language: 'js',
            mutants: [
              {
                id: '1',
                location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
                mutatorName: 'Block',
                replacement: '{}',
                status: 'Killed',
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
        '----------|---------|----------|-----------|------------|----------|----------|',
        'File      | % score | # killed | # timeout | # survived | # no cov | # errors |',
        '----------|---------|----------|-----------|------------|----------|----------|',
        `All files |${chalk.green('  100.00 ')}|        1 |         0 |          0 |        0 |        0 |`,
        ` file.js  |${chalk.grey('     n/a ')}|        0 |         0 |          0 |        0 |        0 |`,
        ` file2.js |${chalk.green('  100.00 ')}|        1 |         0 |          0 |        0 |        0 |`,
        '----------|---------|----------|-----------|------------|----------|----------|',
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

    describe('mutants', () => {
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
      it('should report a killed mutant to debug', async () => {
        mutant.status = 'Killed';
        mutant.killedBy = ['1'];
        act(report);
        expect(testInjector.logger.debug).calledWithMatch(sinon.match('[Killed] Math'));
        expect(testInjector.logger.debug).calledWith(`${chalk.red('-   foo')}`);
        expect(testInjector.logger.debug).calledWith(`${chalk.green('+   bar')}`);
        expect(testInjector.logger.debug).calledWith('Killed by: foo should be bar');
      });

      it('should report a CompileError mutant to debug', async () => {
        mutant.status = 'CompileError';
        mutant.statusReason = 'could not call bar of undefined';
        act(report);
        expect(testInjector.logger.debug).calledWithMatch(sinon.match('[CompileError] Math'));
        expect(testInjector.logger.debug).calledWith(`${chalk.red('-   foo')}`);
        expect(testInjector.logger.debug).calledWith(`${chalk.green('+   bar')}`);
        expect(testInjector.logger.debug).calledWith('Error message: could not call bar of undefined');
      });

      it('should report a NoCoverage mutant to stdout', async () => {
        mutant.status = 'NoCoverage';
        act(report);
        expect(stdoutStub).calledWithMatch(sinon.match('[NoCoverage] Math'));
        expect(stdoutStub).calledWith(`${chalk.red('-   foo')}${os.EOL}`);
        expect(stdoutStub).calledWith(`${chalk.green('+   bar')}${os.EOL}`);
      });

      it('should report a Survived mutant to stdout', async () => {
        mutant.status = 'Survived';
        act(report);
        expect(stdoutStub).calledWithMatch(sinon.match('[Survived] Math'));
      });

      it('should not report a Survived mutant to stdout when reportMutants is not true', async () => {
        testInjector.options.clearTextReporter.reportMutants = false;
        mutant.status = 'Survived';
        act(report);
        expect(stdoutStub).not.calledWithMatch(sinon.match('[Survived] Math'));
      });

      it('should not report a NoCoverage mutant to stdout when reportMutants is not true', async () => {
        testInjector.options.clearTextReporter.reportMutants = false;
        mutant.status = 'NoCoverage';
        act(report);
        expect(stdoutStub).not.calledWithMatch(sinon.match('[NoCoverage] Math'));
      });

      it('should report a Timeout mutant to stdout', async () => {
        mutant.status = 'Timeout';
        act(report);
        expect(testInjector.logger.debug).calledWithMatch(sinon.match('[Timeout] Math'));
      });

      it('should report the tests ran for a Survived mutant to stdout for "perTest" coverage analysis', async () => {
        mutant.coveredBy = ['1', '2', '3'];
        mutant.status = 'Survived';
        act(report);
        expect(stdoutStub).calledWithExactly(`Tests ran:${os.EOL}`);
        expect(stdoutStub).calledWithExactly(`    foo should be bar${os.EOL}`);
        expect(stdoutStub).calledWithExactly(`    bar should be baz${os.EOL}`);
        expect(stdoutStub).calledWithExactly(`    baz should be qux${os.EOL}`);
      });

      it('should report the max tests to log and however many more tests', async () => {
        testInjector.options.clearTextReporter.maxTestsToLog = 2;
        mutant.coveredBy = ['1', '2', '3'];
        mutant.status = 'Survived';
        act(report);
        expect(stdoutStub).calledWithExactly(`Tests ran:${os.EOL}`);
        expect(stdoutStub).calledWithExactly(`    foo should be bar${os.EOL}`);
        expect(stdoutStub).calledWithExactly(`    bar should be baz${os.EOL}`);
        const allCalls = stdoutStub.getCalls().map((call) => call.args.join(''));
        expect(allCalls.filter((call) => call.includes('baz should be qux'))).lengthOf(1, 'Test "baz should be qux" was written more than once');
        expect(stdoutStub).calledWithExactly(`  and 1 more test!${os.EOL}`);
      });

      it('should report that all tests have ran for a surviving mutant that is static', async () => {
        testInjector.options.clearTextReporter.maxTestsToLog = 2;
        mutant.static = true;
        mutant.status = 'Survived';
        act(report);
        expect(stdoutStub).calledWithExactly(`Ran all tests for this mutant.${os.EOL}`);
      });

      it('should not log individual ran tests when logTests is not true', () => {
        testInjector.options.clearTextReporter.logTests = false;
        mutant.coveredBy = ['1', '2', '3'];
        mutant.status = 'Survived';
        act(report);

        const allCalls = stdoutStub.getCalls().map((call) => call.args.join(''));
        expect(process.stdout.write).not.calledWithMatch(sinon.match('Tests ran: '));
        expect(allCalls.filter((call) => call.includes('foo should be bar'))).lengthOf(1, 'Test "foo should be bar" was written more than once');
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
        mutant.status = 'Survived';
        mutant.location.start = { line: 4, column: 6 };
        act(report);

        expect(stdoutStub).to.have.been.calledWithMatch(sinon.match(`${chalk.cyan('foo.js')}:${chalk.yellow('4')}:${chalk.yellow('6')}`));
      });

      it('should log source file names without colored text when clearTextReporter is not false and allowConsoleColors is false', () => {
        testInjector.options.allowConsoleColors = false;
        mutant.status = 'Survived';
        mutant.location.start = { line: 4, column: 6 };
        // Recreate, color setting is set in constructor
        sut = testInjector.injector.injectClass(ClearTextReporter);
        act(report);

        expect(stdoutStub).calledWithMatch(sinon.match('foo.js:4:6'));
      });
    });

    describe('tests', () => {
      it('should report a big list of tests if file names are unknown', () => {
        testInjector.options.clearTextReporter.allowColor = false;
        const report = factory.mutationTestReportSchemaMutationTestResult({
          files: {
            'foo.js': factory.mutationTestReportSchemaFileResult({
              mutants: [
                factory.mutationTestReportSchemaMutantResult({ killedBy: ['0'] }),
                factory.mutationTestReportSchemaMutantResult({ coveredBy: ['1'] }),
              ],
            }),
          },
          testFiles: {
            '': factory.mutationTestReportSchemaTestFile({
              tests: [
                factory.mutationTestReportSchemaTestDefinition({ id: '0', name: 'foo should bar' }),
                factory.mutationTestReportSchemaTestDefinition({ id: '1', name: 'baz should qux' }),
                factory.mutationTestReportSchemaTestDefinition({ id: '2', name: 'quux should corge' }),
              ],
            }),
          },
        });
        act(report);
        expect(stdoutStub).calledWithMatch(sinon.match('All tests'));
        expect(stdoutStub).calledWithMatch(sinon.match('  ✓ foo should bar (killed 1)'));
        expect(stdoutStub).calledWithMatch(sinon.match('  ~ baz should qux (covered 1)'));
        expect(stdoutStub).calledWithMatch(sinon.match('  ✘ quux should corge (covered 0)'));
      });

      it('should not report a list of tests if file names are unknown when reportTests is not true', () => {
        testInjector.options.clearTextReporter.reportTests = false;
        const report = factory.mutationTestReportSchemaMutationTestResult({
          files: {
            'foo.js': factory.mutationTestReportSchemaFileResult({
              mutants: [
                factory.mutationTestReportSchemaMutantResult({ killedBy: ['0'] }),
                factory.mutationTestReportSchemaMutantResult({ coveredBy: ['1'] }),
              ],
            }),
          },
          testFiles: {
            '': factory.mutationTestReportSchemaTestFile({
              tests: [
                factory.mutationTestReportSchemaTestDefinition({ id: '0', name: 'foo should bar' }),
                factory.mutationTestReportSchemaTestDefinition({ id: '1', name: 'baz should qux' }),
                factory.mutationTestReportSchemaTestDefinition({ id: '2', name: 'quux should corge' }),
              ],
            }),
          },
        });
        act(report);
        expect(stdoutStub).not.calledWithMatch(sinon.match('All tests'));
      });

      it('should report in the correct colors', () => {
        testInjector.options.clearTextReporter.allowColor = true;
        const report = factory.mutationTestReportSchemaMutationTestResult({
          files: {
            'foo.js': factory.mutationTestReportSchemaFileResult({
              mutants: [
                factory.mutationTestReportSchemaMutantResult({ killedBy: ['0'] }),
                factory.mutationTestReportSchemaMutantResult({ coveredBy: ['1'] }),
              ],
            }),
          },
          testFiles: {
            '': factory.mutationTestReportSchemaTestFile({
              tests: [
                factory.mutationTestReportSchemaTestDefinition({ id: '0', name: 'foo should bar' }),
                factory.mutationTestReportSchemaTestDefinition({ id: '1', name: 'baz should qux' }),
                factory.mutationTestReportSchemaTestDefinition({ id: '2', name: 'quux should corge' }),
              ],
            }),
          },
        });
        act(report);
        expect(stdoutStub).calledWithMatch(sinon.match('All tests'));
        expect(stdoutStub).calledWithMatch(sinon.match(`${chalk.greenBright('✓')} ${chalk.grey('foo should bar')} (killed 1)`));
        expect(stdoutStub).calledWithMatch(sinon.match(`${chalk.blueBright('~')} ${chalk.grey('baz should qux')} (covered 1)`));
        expect(stdoutStub).calledWithMatch(sinon.match(`${chalk.redBright('✘')} ${chalk.grey('quux should corge')} (covered 0)`));
      });

      it('should report tests per file if file names are unknown', () => {
        testInjector.options.clearTextReporter.allowColor = false;
        const report = factory.mutationTestReportSchemaMutationTestResult({
          files: {
            'foo.js': factory.mutationTestReportSchemaFileResult({
              mutants: [
                factory.mutationTestReportSchemaMutantResult({ killedBy: ['0'] }),
                factory.mutationTestReportSchemaMutantResult({ coveredBy: ['1'] }),
              ],
            }),
          },
          testFiles: {
            'foo.spec.js': factory.mutationTestReportSchemaTestFile({
              tests: [
                factory.mutationTestReportSchemaTestDefinition({ id: '0', name: 'foo should bar' }),
                factory.mutationTestReportSchemaTestDefinition({ id: '1', name: 'baz should qux' }),
              ],
            }),
            'foo.test.js': factory.mutationTestReportSchemaTestFile({
              tests: [factory.mutationTestReportSchemaTestDefinition({ id: '2', name: 'quux should corge' })],
            }),
          },
        });
        act(report);
        expect(stdoutStub).calledWithMatch(sinon.match('All tests'));
        expect(stdoutStub).calledWithMatch(sinon.match('  foo.spec.js'));
        expect(stdoutStub).calledWithMatch(sinon.match('    ✓ foo should bar (killed 1)'));
        expect(stdoutStub).calledWithMatch(sinon.match('    ~ baz should qux (covered 1)'));
        expect(stdoutStub).calledWithMatch(sinon.match('  foo.test.js'));
        expect(stdoutStub).calledWithMatch(sinon.match('    ✘ quux should corge (covered 0)'));
      });

      it('should report the line number if they are known', () => {
        testInjector.options.clearTextReporter.allowColor = false;
        const report = factory.mutationTestReportSchemaMutationTestResult({
          testFiles: {
            'foo.spec.js': factory.mutationTestReportSchemaTestFile({
              tests: [
                factory.mutationTestReportSchemaTestDefinition({ id: '0', name: 'foo should bar', location: { start: { line: 7, column: 1 } } }),
              ],
            }),
          },
        });
        act(report);
        expect(stdoutStub).calledWithMatch(sinon.match('✘ foo should bar [line 7] (covered 0)'));
      });

      it('should merge deep directories with only one entry', () => {
        testInjector.options.clearTextReporter.allowColor = false;
        const report = factory.mutationTestReportSchemaMutationTestResult({
          files: {
            'components/foo.js': factory.mutationTestReportSchemaFileResult({
              mutants: [
                factory.mutationTestReportSchemaMutantResult({ killedBy: ['0'] }),
                factory.mutationTestReportSchemaMutantResult({ coveredBy: ['1'] }),
              ],
            }),
          },
          testFiles: {
            'test/unit/components/foo.spec.js': factory.mutationTestReportSchemaTestFile({
              tests: [factory.mutationTestReportSchemaTestDefinition({ id: '0', name: 'foo should bar' })],
            }),
            'test/unit/components/foo.test.js': factory.mutationTestReportSchemaTestFile({
              tests: [factory.mutationTestReportSchemaTestDefinition({ id: '1', name: 'baz should qux' })],
            }),
            'test/integration/components/foo.it.test.js': factory.mutationTestReportSchemaTestFile({
              tests: [factory.mutationTestReportSchemaTestDefinition({ id: '2', name: 'quux should corge' })],
            }),
          },
        });
        act(report);
        expect(stdoutStub).calledWithMatch(sinon.match('All tests'));
        expect(stdoutStub).calledWithMatch(sinon.match('  unit/components'));
        expect(stdoutStub).calledWithMatch(sinon.match('    foo.spec.js'));
        expect(stdoutStub).calledWithMatch(sinon.match('      ✓ foo should bar (killed 1)'));
        expect(stdoutStub).calledWithMatch(sinon.match('    foo.test.js'));
        expect(stdoutStub).calledWithMatch(sinon.match('      ~ baz should qux (covered 1)'));
        expect(stdoutStub).calledWithMatch(sinon.match(' integration/components/foo.it.test.js'));
        expect(stdoutStub).calledWithMatch(sinon.match('   ✘ quux should corge (covered 0)'));
      });
    });
  });

  function act(report: schema.MutationTestResult) {
    sut.onMutationTestReportReady(report, calculateMutationTestMetrics(report));
  }
});
