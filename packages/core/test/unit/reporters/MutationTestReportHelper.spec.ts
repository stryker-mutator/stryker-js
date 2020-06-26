import sinon = require('sinon');
import { File, Location, Range } from '@stryker-mutator/api/core';
import { MutantResult, MutantStatus, mutationTestReportSchema, Reporter } from '@stryker-mutator/api/report';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { mutantResult } from '@stryker-mutator/test-helpers/src/factory';
import { CompleteDryRunResult } from '@stryker-mutator/api/test_runner2';

import { coreTokens } from '../../../src/di';
import InputFileCollection from '../../../src/input/InputFileCollection';
import { MutationTestReportHelper } from '../../../src/reporters/MutationTestReportHelper';
import * as objectUtils from '../../../src/utils/objectUtils';
import { createMutantTestCoverage } from '../../helpers/producers';

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
      logFiles: () => {},
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

    it('should copy thresholds', () => {
      const actualReport = actReportAll();
      expect(actualReport.thresholds).eq(testInjector.options.thresholds);
    });

    it('should set correct schema version', () => {
      const actualReport = actReportAll();
      expect(actualReport.schemaVersion).eq('1.0');
    });

    it('should correctly map file properties', () => {
      // Arrange
      files.push(new File('foo.js', 'foo content'));
      files.push(new File('bar.html', 'bar content'));
      files.push(new File('baz.vue', 'baz content'));
      files.push(new File('qux.ts', 'qux content'));
      files.push(new File('corge.tsx', 'corge content'));
      const inputMutants = files.map((file) => factory.mutantResult({ sourceFilePath: file.name }));

      // Act
      const actualReport = actReportAll(inputMutants);

      // Assert
      expect(Object.keys(actualReport.files)).lengthOf(5);
      expect(actualReport.files['foo.js']).include({ language: 'javascript', source: 'foo content' });
      expect(actualReport.files['bar.html']).include({ language: 'html', source: 'bar content' });
      expect(actualReport.files['baz.vue']).include({ language: 'html', source: 'baz content' });
      expect(actualReport.files['qux.ts']).include({ language: 'typescript', source: 'qux content' });
      expect(actualReport.files['corge.tsx']).include({ language: 'typescript', source: 'corge content' });
    });

    it('should correctly map basic MutantResult properties', () => {
      // Arrange
      const inputMutants = [
        factory.mutantResult({
          id: '1',
          mutatorName: 'Foo',
          replacement: 'foo replacement',
          sourceFilePath: 'foo.js',
          status: MutantStatus.Killed,
        }),
        factory.mutantResult({
          sourceFilePath: 'bar.js',
          status: MutantStatus.NoCoverage,
        }),
        factory.mutantResult({
          sourceFilePath: 'baz.js',
          status: MutantStatus.RuntimeError,
        }),
        factory.mutantResult({
          sourceFilePath: 'qux.js',
          status: MutantStatus.Survived,
        }),
        factory.mutantResult({
          sourceFilePath: '5.js',
          status: MutantStatus.TimedOut,
        }),
        factory.mutantResult({
          sourceFilePath: '6.js',
          status: MutantStatus.TranspileError,
        }),
      ];
      files.push(...inputMutants.map((m) => new File(m.sourceFilePath, '')));

      // Act
      const actualReport = actReportAll(inputMutants);

      // Assert
      expect(Object.keys(actualReport.files)).lengthOf(6);
      expect(actualReport.files['foo.js'].mutants[0]).include({
        id: '1',
        mutatorName: 'Foo',
        replacement: 'foo replacement',
        status: mutationTestReportSchema.MutantStatus.Killed,
      });
      expect(actualReport.files['bar.js'].mutants[0]).include({ status: mutationTestReportSchema.MutantStatus.NoCoverage });
      expect(actualReport.files['baz.js'].mutants[0]).include({ status: mutationTestReportSchema.MutantStatus.RuntimeError });
      expect(actualReport.files['qux.js'].mutants[0]).include({ status: mutationTestReportSchema.MutantStatus.Survived });
      expect(actualReport.files['5.js'].mutants[0]).include({ status: mutationTestReportSchema.MutantStatus.Timeout });
      expect(actualReport.files['6.js'].mutants[0]).include({ status: mutationTestReportSchema.MutantStatus.CompileError });
    });

    it('should offset location correctly', () => {
      const inputMutants = [factory.mutantResult({ location: { end: { line: 3, column: 4 }, start: { line: 1, column: 2 } } })];
      files.push(...inputMutants.map((m) => new File(m.sourceFilePath, '')));
      const actualReport = actReportAll(inputMutants);
      expect(actualReport.files['file.js'].mutants[0].location).deep.eq({ end: { line: 4, column: 5 }, start: { line: 2, column: 3 } });
    });

    it('should group mutants by file name', () => {
      // Arrange
      const inputMutants = [
        factory.mutantResult({
          mutatorName: 'Foo',
          sourceFilePath: 'foo.js',
        }),
        factory.mutantResult({
          mutatorName: 'Bar',
          sourceFilePath: 'foo.js',
        }),
      ];
      files.push(new File('foo.js', ''));

      // Act
      const actualReport = actReportAll(inputMutants);

      // Assert
      expect(Object.keys(actualReport.files)).lengthOf(1);
      expect(actualReport.files['foo.js'].mutants).lengthOf(2);
    });

    it('should log a warning if source file could not be found', () => {
      const inputMutants = [factory.mutantResult({ sourceFilePath: 'not-found.js' })];
      const actualReport = actReportAll(inputMutants);
      expect(Object.keys(actualReport.files)).lengthOf(0);
      expect(testInjector.logger.warn).calledWithMatch('File "not-found.js" not found');
    });

    describe('determineExitCode', () => {
      beforeEach(() => {
        files.push(new File('file.js', ''));
      });

      it('should not set exit code = 1 if `threshold.break` is not configured', () => {
        actReportAll([mutantResult({ status: MutantStatus.Survived })]);

        expect(setExitCodeStub).not.called;
        expect(testInjector.logger.debug).calledWith(
          "No breaking threshold configured. Won't fail the build no matter how low your mutation score is. Set `thresholds.break` to change this behavior."
        );
      });

      it('should not set exit code = 1 if `threshold.break` === score', () => {
        testInjector.options.thresholds.break = 50;
        actReportAll([mutantResult({ status: MutantStatus.Survived }), mutantResult({ status: MutantStatus.Killed })]); // 50 %
        expect(setExitCodeStub).not.called;
        expect(testInjector.logger.info).calledWith('Final mutation score of 50.00 is greater than or equal to break threshold 50');
      });

      it('should set exit code = 1 if `threshold.break` > score', () => {
        testInjector.options.thresholds.break = 50.01;
        actReportAll([mutantResult({ status: MutantStatus.Survived }), mutantResult({ status: MutantStatus.Killed })]); // 50 %
        expect(setExitCodeStub).calledWith(1);
        expect(testInjector.logger.error).calledWith('Final mutation score 50.00 under breaking threshold 50.01, setting exit code to 1 (failure).');
        expect(testInjector.logger.info).calledWith('(improve mutation score or set `thresholds.break = null` to prevent this error in the future)');
      });
    });
    function actReportAll(input: MutantResult[] = []): mutationTestReportSchema.MutationTestResult {
      sut.reportAll(input);
      return reporterMock.onMutationTestReportReady.firstCall.args[0];
    }
  });

  describe(MutationTestReportHelper.prototype.reportOne.name, () => {
    beforeEach(() => {
      inputFiles = new InputFileCollection([new File('add.js', 'function add(a, b) {\n  return a + b;\n}\n')], ['add.js']);
    });

    it('should map simple attributes to the mutant result', () => {
      // Arrange
      const sut = createSut();
      const location: Location = Object.freeze({ start: Object.freeze({ line: 1, column: 5 }), end: Object.freeze({ line: 3, column: 1 }) });
      const range: Range = [21, 35];

      // Act
      const actual = sut.reportOne(
        createMutantTestCoverage({
          mutant: factory.mutant({
            id: 32,
            fileName: 'add.js',
            location,
            replacement: '{}',
            mutatorName: 'fooMutator',
            range,
          }),
        }),
        MutantStatus.Killed
      );

      // Assert
      const expected: Partial<MutantResult> = {
        id: '32',
        location,
        mutatorName: 'fooMutator',
        range,
        status: MutantStatus.Killed,
        sourceFilePath: 'add.js',
        replacement: '{}',
      };
      const partialActualResult = Object.keys(expected).reduce((obj, prop) => ({ ...obj, [prop]: actual[prop as keyof MutantResult] }), {});
      expect(partialActualResult).deep.eq(expected);
    });

    it('should report onMutantTested', () => {
      // Arrange
      const sut = createSut();

      // Act
      const actual = sut.reportOne(
        createMutantTestCoverage({
          mutant: factory.mutant({
            fileName: 'add.js',
          }),
        }),
        MutantStatus.Killed
      );

      // Assert
      expect(reporterMock.onMutantTested).calledWithExactly(actual);
    });

    // TODO: Report `killedBy` and `runTests` fields.
  });
});
