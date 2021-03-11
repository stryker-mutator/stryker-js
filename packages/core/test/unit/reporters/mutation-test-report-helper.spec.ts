import sinon from 'sinon';
import { File, Location, MutantResult, MutantStatus, Range, schema } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/report';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { CompleteDryRunResult } from '@stryker-mutator/api/test-runner';
import { CheckStatus } from '@stryker-mutator/api/check';

import { calculateMutationTestMetrics } from 'mutation-testing-metrics';

import { coreTokens } from '../../../src/di';
import { InputFileCollection } from '../../../src/input/input-file-collection';
import { MutationTestReportHelper } from '../../../src/reporters/mutation-test-report-helper';
import * as objectUtils from '../../../src/utils/object-utils';

describe(MutationTestReportHelper.name, () => {
  let reporterMock: sinon.SinonStubbedInstance<Required<Reporter>>;
  let inputFiles: InputFileCollection;
  let files: File[];
  let setExitCodeStub: sinon.SinonStub;
  let dryRunResult: CompleteDryRunResult;

  beforeEach(() => {
    reporterMock = factory.reporter();
    setExitCodeStub = sinon.stub(objectUtils, 'setExitCode');
    files = [];
    inputFiles = {
      files,
      filesToMutate: [],
      logFiles: () => {
        // idle
      },
    };
    dryRunResult = factory.completeDryRunResult();
  });

  function createSut() {
    return testInjector.injector
      .provideValue(coreTokens.reporter, reporterMock)
      .provideValue(coreTokens.inputFiles, inputFiles)
      .provideValue(coreTokens.dryRunResult, dryRunResult)
      .injectClass(MutationTestReportHelper);
  }

  describe(MutationTestReportHelper.prototype.reportAll.name, () => {
    let sut: MutationTestReportHelper;

    beforeEach(() => {
      sut = createSut();
    });

    it('should report "mutationTestReportReady"', () => {
      sut.reportAll([]);
      expect(reporterMock.onMutationTestReportReady).calledOnce;
    });

    it('should report "onAllMutantsTested"', () => {
      sut.reportAll([]);
      expect(reporterMock.onAllMutantsTested).calledOnce;
    });

    it('should report "onAllMutantsTested" before mutationTestReportReady', () => {
      sut.reportAll([]);
      expect(reporterMock.onAllMutantsTested).calledBefore(reporterMock.onMutationTestReportReady);
    });

    it('should copy thresholds', () => {
      const [actualReport] = actReportAll();
      expect(actualReport.thresholds).eq(testInjector.options.thresholds);
    });

    it('should set correct schema version', () => {
      const [actualReport] = actReportAll();
      expect(actualReport.schemaVersion).eq('1.0');
    });

    it('should correctly map system under test file properties', () => {
      // Arrange
      files.push(new File('foo.js', 'foo content'));
      files.push(new File('bar.html', 'bar content'));
      files.push(new File('baz.vue', 'baz content'));
      files.push(new File('qux.ts', 'qux content'));
      files.push(new File('corge.tsx', 'corge content'));
      const inputMutants = files.map((file) => factory.killedMutantResult({ fileName: file.name }));

      // Act
      const [actualReport] = actReportAll(inputMutants);

      // Assert
      expect(Object.keys(actualReport.files)).lengthOf(5);
      expect(actualReport.files['foo.js']).include({ language: 'javascript', source: 'foo content' });
      expect(actualReport.files['bar.html']).include({ language: 'html', source: 'bar content' });
      expect(actualReport.files['baz.vue']).include({ language: 'html', source: 'baz content' });
      expect(actualReport.files['qux.ts']).include({ language: 'typescript', source: 'qux content' });
      expect(actualReport.files['corge.tsx']).include({ language: 'typescript', source: 'corge content' });
    });

    it('should correctly test file properties', () => {
      // Arrange
      dryRunResult.tests.push(factory.testResult({ id: 'spec1', name: 'dog should not eat dog', fileName: 'foo.spec.js' }));
      files.push(new File('foo.js', 'foo content'), new File('foo.spec.js', 'it("dog should not eat dog")'), new File('baz.js', 'baz content'));

      // Act
      const [actualReport] = actReportAll();

      // Assert
      expect(actualReport.testFiles?.['foo.spec.js'].source).eq('it("dog should not eat dog")');
    });

    it('should report the tests in `testFiles`', () => {
      // Arrange
      dryRunResult.tests.push(
        factory.testResult({ id: 'spec1', name: 'dog should not eat dog' }),
        factory.testResult({ id: 'spec2', name: 'dog should chase its own tail' })
      );

      // Act
      const [actualReport] = actReportAll([]);

      // Assert
      const expected: schema.TestFileDefinitionDictionary = {
        ['']: {
          tests: [
            { id: '0', name: 'dog should not eat dog' },
            { id: '1', name: 'dog should chase its own tail' },
          ],
        },
      };
      expect(actualReport.testFiles).deep.eq(expected);
    });

    it('should correctly map basic MutantResult properties', () => {
      // Arrange
      const killedMutantResult: MutantResult = {
        id: '1',
        mutatorName: 'Foo',
        replacement: 'foo replacement',
        fileName: 'foo.js',
        description: 'this is mutant foo',
        duration: 42,
        location: factory.location(),
        range: [1, 2],
        static: true,
        statusReason: 'smacked on the head',
        testsCompleted: 32,
        status: MutantStatus.Killed,
      };
      const inputMutants = [
        killedMutantResult,
        factory.mutantResult({
          fileName: 'bar.js',
          status: MutantStatus.NoCoverage,
        }),
        factory.mutantResult({
          fileName: 'baz.js',
          status: MutantStatus.RuntimeError,
        }),
        factory.mutantResult({
          fileName: 'qux.js',
          status: MutantStatus.Survived,
        }),
        factory.mutantResult({
          fileName: '5.js',
          status: MutantStatus.Timeout,
        }),
        factory.mutantResult({
          fileName: '6.js',
          status: MutantStatus.CompileError,
        }),
      ];
      files.push(...inputMutants.map((m) => new File(m.fileName, '')));

      // Act
      const [actualReport] = actReportAll(inputMutants);

      // Assert
      const expectedKilledMutant: Partial<schema.MutantResult> = {
        id: '1',
        mutatorName: 'Foo',
        replacement: 'foo replacement',
        description: 'this is mutant foo',
        duration: 42,
        static: true,
        statusReason: 'smacked on the head',
        testsCompleted: 32,
        status: MutantStatus.Killed,
      };
      expect(Object.keys(actualReport.files)).lengthOf(6);
      expect(actualReport.files['foo.js'].mutants[0]).include(expectedKilledMutant);
      expect(actualReport.files['bar.js'].mutants[0]).include({ status: MutantStatus.NoCoverage });
      expect(actualReport.files['baz.js'].mutants[0]).include({ status: MutantStatus.RuntimeError });
      expect(actualReport.files['qux.js'].mutants[0]).include({ status: MutantStatus.Survived });
      expect(actualReport.files['5.js'].mutants[0]).include({ status: MutantStatus.Timeout });
      expect(actualReport.files['6.js'].mutants[0]).include({ status: MutantStatus.CompileError });
    });

    it('should offset location correctly', () => {
      const inputMutants = [factory.mutantResult({ location: { end: { line: 3, column: 4 }, start: { line: 1, column: 2 } } })];
      files.push(...inputMutants.map((m) => new File(m.fileName, '')));
      const [actualReport] = actReportAll(inputMutants);
      expect(actualReport.files['file.js'].mutants[0].location).deep.eq({ end: { line: 4, column: 5 }, start: { line: 2, column: 3 } });
    });

    it('should remap test ids if possible (for brevity, since mocha, jest and karma use test titles as test ids)', () => {
      // Arrange
      dryRunResult.tests.push(
        factory.testResult({ id: 'foo should bar', name: 'foo should bar' }),
        factory.testResult({ id: 'baz should qux', name: 'baz should qux' })
      );
      const killedMutantResult = factory.mutantResult({
        fileName: 'foo.js',
        killedBy: ['foo should bar'],
        coveredBy: ['foo should bar', 'baz should qux', 'not found'],
      });
      files.push(new File('foo.js', ''));

      // Act
      const [actualReport] = actReportAll([killedMutantResult]);

      // Assert
      const expectedTests: schema.TestDefinition[] = [
        { id: '0', name: 'foo should bar' },
        { id: '1', name: 'baz should qux' },
      ];
      const actualResultMutant = actualReport.files['foo.js'].mutants[0];
      expect(actualReport.testFiles?.[''].tests).deep.eq(expectedTests);
      expect(actualResultMutant.coveredBy).deep.eq(['0', '1', 'not found']);
      expect(actualResultMutant.killedBy).deep.eq(['0']);
    });

    it('should group mutants by file name', () => {
      // Arrange
      const inputMutants = [
        factory.mutantResult({
          mutatorName: 'Foo',
          fileName: 'foo.js',
        }),
        factory.mutantResult({
          mutatorName: 'Bar',
          fileName: 'foo.js',
        }),
      ];
      files.push(new File('foo.js', ''));

      // Act
      const [actualReport] = actReportAll(inputMutants);

      // Assert
      expect(Object.keys(actualReport.files)).lengthOf(1);
      expect(actualReport.files['foo.js'].mutants).lengthOf(2);
    });

    it('should group test by test file name', () => {
      // Arrange
      dryRunResult.tests.push(
        factory.testResult({ fileName: 'foo.spec.js', name: '1' }),
        factory.testResult({ fileName: 'bar.spec.js', name: '2' }),
        factory.testResult({ fileName: 'foo.spec.js', name: '3' })
      );
      files.push(new File('foo.spec.js', ''), new File('bar.spec.js', ''));

      // Act
      const [actualReport] = actReportAll([]);

      // Assert
      expect(Object.keys(actualReport.testFiles!)).lengthOf(2);
      expect(actualReport.testFiles!['foo.spec.js'].tests).lengthOf(2);
      expect(actualReport.testFiles!['foo.spec.js'].tests[0].name).eq('1');
      expect(actualReport.testFiles!['foo.spec.js'].tests[1].name).eq('3');
      expect(actualReport.testFiles!['bar.spec.js'].tests[0].name).eq('2');
    });

    it('should log a warning if source file could not be found', () => {
      const inputMutants = [factory.killedMutantResult({ fileName: 'not-found.js' })];
      const [actualReport] = actReportAll(inputMutants);
      expect(actualReport.files['not-found.js'].mutants).lengthOf(1);
      expect(testInjector.logger.warn).calledWithMatch('File "not-found.js" not found');
    });

    it('should log a warning the test file could not be found', () => {
      dryRunResult.tests.push(factory.testResult({ fileName: 'foo.spec.js' }));
      actReportAll([]);
      expect(testInjector.logger.warn).calledWithMatch('Test file "foo.spec.js" not found in input files');
    });

    it('should provide the metrics as second argument', () => {
      // Arrange
      const inputMutants: MutantResult[] = [
        {
          mutatorName: 'Foo',
          fileName: 'foo.js',
          status: MutantStatus.Killed,
          range: [1, 2],
          location: { start: { line: 1, column: 2 }, end: { line: 4, column: 5 } },
          replacement: '+',
          id: '1',
        },
      ];
      files.push(new File('foo.js', ''));
      dryRunResult.tests.push(factory.testResult({ id: 'foo should bar', name: 'foo should bar' }));

      // Act
      const [actualReport, metrics] = actReportAll(inputMutants);

      // Assert
      expect(metrics).deep.eq(calculateMutationTestMetrics(actualReport));
    });

    describe('determineExitCode', () => {
      beforeEach(() => {
        files.push(new File('file.js', ''));
      });

      it('should not set exit code = 1 if `threshold.break` is not configured', () => {
        actReportAll([factory.mutantResult({ status: MutantStatus.Survived })]);

        expect(setExitCodeStub).not.called;
        expect(testInjector.logger.debug).calledWith(
          "No breaking threshold configured. Won't fail the build no matter how low your mutation score is. Set `thresholds.break` to change this behavior."
        );
      });

      it('should not set exit code = 1 if `threshold.break` === score', () => {
        testInjector.options.thresholds.break = 50;
        actReportAll([factory.mutantResult({ status: MutantStatus.Survived }), factory.mutantResult({ status: MutantStatus.Killed })]); // 50 %
        expect(setExitCodeStub).not.called;
        expect(testInjector.logger.info).calledWith('Final mutation score of 50.00 is greater than or equal to break threshold 50');
      });

      it('should set exit code = 1 if `threshold.break` > score', () => {
        testInjector.options.thresholds.break = 50.01;
        actReportAll([factory.mutantResult({ status: MutantStatus.Survived }), factory.mutantResult({ status: MutantStatus.Killed })]); // 50 %
        expect(setExitCodeStub).calledWith(1);
        expect(testInjector.logger.error).calledWith('Final mutation score 50.00 under breaking threshold 50.01, setting exit code to 1 (failure).');
        expect(testInjector.logger.info).calledWith('(improve mutation score or set `thresholds.break = null` to prevent this error in the future)');
      });
    });

    function actReportAll(input: MutantResult[] = []): Parameters<Required<Reporter>['onMutationTestReportReady']> {
      sut.reportAll(input);
      return reporterMock.onMutationTestReportReady.firstCall.args;
    }
  });

  describe('reportOne', () => {
    beforeEach(() => {
      inputFiles = new InputFileCollection([new File('add.js', 'function add(a, b) {\n  return a + b;\n}\n')], ['add.js']);
    });

    describe(MutationTestReportHelper.prototype.reportCheckFailed.name, () => {
      it('should map simple attributes to the mutant result', () => {
        // Arrange
        const sut = createSut();
        const location: Location = Object.freeze({ start: Object.freeze({ line: 1, column: 5 }), end: Object.freeze({ line: 3, column: 1 }) });
        const range: Range = [21, 35];

        // Act
        const actual = sut.reportCheckFailed(
          factory.mutant({
            id: '32',
            fileName: 'add.js',
            location,
            replacement: '{}',
            mutatorName: 'fooMutator',
            range,
          }),
          factory.failedCheckResult()
        );

        // Assert
        const expected: Partial<MutantResult> = {
          id: '32',
          location,
          mutatorName: 'fooMutator',
          range,
          fileName: 'add.js',
          replacement: '{}',
        };
        expect(actual).include(expected);
      });

      it('should report statusReason', () => {
        // Arrange
        const sut = createSut();

        // Act
        const actual = sut.reportCheckFailed(
          factory.mutant({ fileName: 'add.js' }),
          factory.failedCheckResult({ status: CheckStatus.CompileError, reason: 'cannot call foo of undefined' })
        );

        // Assert
        const expected: Partial<MutantResult> = {
          status: MutantStatus.CompileError,
          statusReason: 'cannot call foo of undefined',
        };
        expect(actual).include(expected);
      });
    });

    describe(MutationTestReportHelper.prototype.reportMutantStatus.name, () => {
      it('should correctly map all properties', () => {
        // Arrange
        const input = factory.mutantTestCoverage({
          fileName: 'add.js',
          id: '3',
          location: factory.location(),
          mutatorName: 'fooMutator',
          range: [1, 3],
          replacement: '"bar"',
          coveredBy: ['1'],
          static: false,
        });
        const sut = createSut();

        // Act
        const actual = sut.reportMutantStatus(input, MutantStatus.NoCoverage);

        // Assert
        const expected: MutantResult = {
          status: MutantStatus.NoCoverage,
          fileName: 'add.js',
          id: '3',
          location: factory.location(),
          mutatorName: 'fooMutator',
          range: [1, 3],
          replacement: '"bar"',
          coveredBy: ['1'],
          static: false,
        };
        expect(actual).deep.include(expected);
      });
    });

    describe(MutationTestReportHelper.prototype.reportMutantRunResult.name, () => {
      it('should report a killed mutant when called with a KilledMutantRunResult', () => {
        // Arrange
        dryRunResult.tests.push(factory.failedTestResult({ id: '1', name: 'foo should be bar' }));
        const sut = createSut();

        // Act
        const actual = sut.reportMutantRunResult(
          factory.mutantTestCoverage({ fileName: 'add.js' }),
          factory.killedMutantRunResult({ killedBy: '1', nrOfTests: 42, failureMessage: 'foo should have been bar at line 1' })
        );

        // Assert
        const expected: Partial<MutantResult> = {
          status: MutantStatus.Killed,
          killedBy: ['1'],
          testsCompleted: 42,
          statusReason: 'foo should have been bar at line 1',
        };
        expect(actual).deep.include(expected);
      });

      it('should report a runtime error when called with an ErrorMutantRunResult', () => {
        // Arrange
        const sut = createSut();

        // Act
        const actual = sut.reportMutantRunResult(
          factory.mutantTestCoverage({ fileName: 'add.js' }),
          factory.errorMutantRunResult({ errorMessage: 'Cannot call foo of null' })
        );

        // Assert
        const expected: Partial<MutantResult> = {
          status: MutantStatus.RuntimeError,
          statusReason: 'Cannot call foo of null',
        };
        expect(actual).deep.include(expected);
      });

      it('should report a timeout mutant when called with a TimeoutMutantRunResult', () => {
        // Arrange
        const sut = createSut();

        // Act
        const actual = sut.reportMutantRunResult(factory.mutantTestCoverage({ fileName: 'add.js' }), factory.timeoutMutantRunResult());

        // Assert
        const expected: Partial<MutantResult> = {
          status: MutantStatus.Timeout,
        };
        expect(actual).deep.include(expected);
      });

      it('should report a survived mutant when called with a SurvivedMutantRunResult', () => {
        // Arrange
        dryRunResult.tests.push(factory.failedTestResult({ id: '1', name: 'foo should be bar' }));
        const sut = createSut();

        // Act
        const actual = sut.reportMutantRunResult(
          factory.mutantTestCoverage({ fileName: 'add.js', coveredBy: ['1'] }),
          factory.survivedMutantRunResult({ nrOfTests: 4 })
        );

        // Assert
        const expected: Partial<MutantResult> = {
          status: MutantStatus.Survived,
          coveredBy: ['1'],
          testsCompleted: 4,
        };
        expect(actual).deep.include(expected);
      });

      it('should be able to report coveredBy as `undefined` for a survived mutant', () => {
        // Arrange
        dryRunResult.tests.push(factory.failedTestResult({ id: '1', name: 'foo should be bar' }));
        const sut = createSut();

        // Act
        const actual = sut.reportMutantRunResult(
          factory.mutantTestCoverage({ fileName: 'add.js', coveredBy: undefined }),
          factory.survivedMutantRunResult()
        );

        // Assert
        const expected: Partial<MutantResult> = {
          status: MutantStatus.Survived,
          coveredBy: undefined,
        };
        expect(actual).deep.include(expected);
      });
    });
  });
});
