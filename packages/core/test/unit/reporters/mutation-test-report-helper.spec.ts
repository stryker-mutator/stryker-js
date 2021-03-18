import sinon from 'sinon';
import { File, Location, Range } from '@stryker-mutator/api/core';
import {
  MutantResult,
  MutantStatus,
  mutationTestReportSchema,
  Reporter,
  InvalidMutantResult,
  UndetectedMutantResult,
  KilledMutantResult,
  TimeoutMutantResult,
  IgnoredMutantResult,
} from '@stryker-mutator/api/report';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { CompleteDryRunResult } from '@stryker-mutator/api/test-runner';
import { CheckStatus } from '@stryker-mutator/api/check';

import { coreTokens } from '../../../src/di';
import { InputFileCollection } from '../../../src/input/input-file-collection';
import { MutationTestReportHelper } from '../../../src/reporters/mutation-test-report-helper';
import * as objectUtils from '../../../src/utils/object-utils';
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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      logFiles: () => {},
      mutationRangeToInstrument: [],
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
      const inputMutants = files.map((file) => factory.killedMutantResult({ fileName: file.name }));

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
        factory.killedMutantResult({
          id: '1',
          mutatorName: 'Foo',
          replacement: 'foo replacement',
          fileName: 'foo.js',
          status: MutantStatus.Killed,
        }),
        factory.undetectedMutantResult({
          fileName: 'bar.js',
          status: MutantStatus.NoCoverage,
        }),
        factory.invalidMutantResult({
          fileName: 'baz.js',
          status: MutantStatus.RuntimeError,
        }),
        factory.undetectedMutantResult({
          fileName: 'qux.js',
          status: MutantStatus.Survived,
        }),
        factory.timeoutMutantResult({
          fileName: '5.js',
          status: MutantStatus.TimedOut,
        }),
        factory.invalidMutantResult({
          fileName: '6.js',
          status: MutantStatus.CompileError,
        }),
      ];
      files.push(...inputMutants.map((m) => new File(m.fileName, '')));

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
      const inputMutants = [factory.killedMutantResult({ location: { end: { line: 3, column: 4 }, start: { line: 1, column: 2 } } })];
      files.push(...inputMutants.map((m) => new File(m.fileName, '')));
      const actualReport = actReportAll(inputMutants);
      expect(actualReport.files['file.js'].mutants[0].location).deep.eq({ end: { line: 4, column: 5 }, start: { line: 2, column: 3 } });
    });

    it('should group mutants by file name', () => {
      // Arrange
      const inputMutants = [
        factory.killedMutantResult({
          mutatorName: 'Foo',
          fileName: 'foo.js',
        }),
        factory.undetectedMutantResult({
          mutatorName: 'Bar',
          fileName: 'foo.js',
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
      const inputMutants = [factory.killedMutantResult({ fileName: 'not-found.js' })];
      const actualReport = actReportAll(inputMutants);
      expect(Object.keys(actualReport.files)).lengthOf(0);
      expect(testInjector.logger.warn).calledWithMatch('File "not-found.js" not found');
    });

    describe('determineExitCode', () => {
      beforeEach(() => {
        files.push(new File('file.js', ''));
      });

      it('should not set exit code = 1 if `threshold.break` is not configured', () => {
        actReportAll([factory.undetectedMutantResult({ status: MutantStatus.Survived })]);

        expect(setExitCodeStub).not.called;
        expect(testInjector.logger.debug).calledWith(
          "No breaking threshold configured. Won't fail the build no matter how low your mutation score is. Set `thresholds.break` to change this behavior."
        );
      });

      it('should not set exit code = 1 if `threshold.break` === score', () => {
        testInjector.options.thresholds.break = 50;
        actReportAll([
          factory.undetectedMutantResult({ status: MutantStatus.Survived }),
          factory.killedMutantResult({ status: MutantStatus.Killed }),
        ]); // 50 %
        expect(setExitCodeStub).not.called;
        expect(testInjector.logger.info).calledWith('Final mutation score of 50.00 is greater than or equal to break threshold 50');
      });

      it('should set exit code = 1 if `threshold.break` > score', () => {
        testInjector.options.thresholds.break = 50.01;
        actReportAll([
          factory.undetectedMutantResult({ status: MutantStatus.Survived }),
          factory.killedMutantResult({ status: MutantStatus.Killed }),
        ]); // 50 %
        expect(setExitCodeStub).calledWith(1);
        expect(testInjector.logger.error).calledWith('Final mutation score 50.00 under breaking threshold 50.01, setting exit code to 1 (failure).');
        expect(testInjector.logger.info).calledWith('(improve mutation score or set `thresholds.break = null` to prevent this error in the future)');
      });
    });

    describe('determine description', () => {
      beforeEach(() => {
        files.push(new File('file.js', ''));
      });

      it('should provide the error message as description', () => {
        const mutantResult = factory.invalidMutantResult({ fileName: 'file.js', errorMessage: 'Cannot call "foo" of undefined' });
        const actualReport = actReportAll([mutantResult]);
        expect(actualReport.files['file.js'].mutants[0].description).eq('Error message: Cannot call "foo" of undefined');
      });

      it('should provide the "killedBy" as description', () => {
        const mutantResult = factory.killedMutantResult({ fileName: 'file.js', killedBy: 'Foo should be bar' });
        const actualReport = actReportAll([mutantResult]);
        expect(actualReport.files['file.js'].mutants[0].description).eq('Killed by: Foo should be bar');
      });

      it('should provide the ignore reason as description', () => {
        const mutantResult = factory.ignoredMutantResult({ fileName: 'file.js', ignoreReason: 'Ignored by "fooMutator" in excludedMutations' });
        const actualReport = actReportAll([mutantResult]);
        expect(actualReport.files['file.js'].mutants[0].description).eq('Ignore reason: Ignored by "fooMutator" in excludedMutations');
      });
    });

    function actReportAll(input: MutantResult[] = []): mutationTestReportSchema.MutationTestResult {
      sut.reportAll(input);
      return reporterMock.onMutationTestReportReady.firstCall.args[0];
    }
  });

  describe('reportOne', () => {
    beforeEach(() => {
      inputFiles = new InputFileCollection([new File('add.js', 'function add(a, b) {\n  return a + b;\n}\n')], ['add.js'], []);
    });

    it('should map simple attributes to the mutant result', () => {
      // Arrange
      const sut = createSut();
      const location: Location = Object.freeze({ start: Object.freeze({ line: 1, column: 5 }), end: Object.freeze({ line: 3, column: 1 }) });
      const range: Range = [21, 35];

      // Act
      const actual = sut.reportCheckFailed(
        factory.mutant({
          id: 32,
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

    it('should report failed message on reportCheckFailed', () => {
      // Arrange
      const sut = createSut();

      // Act
      const actual = sut.reportCheckFailed(
        factory.mutant({ fileName: 'add.js' }),
        factory.failedCheckResult({ status: CheckStatus.CompileError, reason: 'cannot call foo of undefined' })
      );

      // Assert
      const expected: Partial<InvalidMutantResult> = {
        status: MutantStatus.CompileError,
        errorMessage: 'cannot call foo of undefined',
      };
      expect(actual).include(expected);
    });

    it('should report an empty test filter on reportNoCoverage', () => {
      // Arrange
      const sut = createSut();

      // Act
      const actual = sut.reportNoCoverage(factory.mutant({ fileName: 'add.js' }));

      // Assert
      const expected: Partial<UndetectedMutantResult> = {
        status: MutantStatus.NoCoverage,
        testFilter: [],
      };
      expect(actual).deep.include(expected);
    });

    it('should report a killed mutant on reportMutantRunResult with a KilledMutantRunResult', () => {
      // Arrange
      dryRunResult.tests.push(factory.failedTestResult({ id: '1', name: 'foo should be bar' }));
      const sut = createSut();

      // Act
      const actual = sut.reportMutantRunResult(
        createMutantTestCoverage({ mutant: factory.mutant({ fileName: 'add.js' }) }),
        factory.killedMutantRunResult({ killedBy: '1', nrOfTests: 42 })
      );

      // Assert
      const expected: Partial<KilledMutantResult> = {
        status: MutantStatus.Killed,
        killedBy: 'foo should be bar',
        nrOfTestsRan: 42,
      };
      expect(actual).deep.include(expected);
    });

    it('should report a runtime error mutant on reportMutantRunResult with a ErrorMutantRunResult', () => {
      // Arrange
      const sut = createSut();

      // Act
      const actual = sut.reportMutantRunResult(
        createMutantTestCoverage({ mutant: factory.mutant({ fileName: 'add.js' }) }),
        factory.errorMutantRunResult({ errorMessage: 'Cannot call foo of null' })
      );

      // Assert
      const expected: Partial<InvalidMutantResult> = {
        status: MutantStatus.RuntimeError,
        errorMessage: 'Cannot call foo of null',
      };
      expect(actual).deep.include(expected);
    });

    it('should report a timeout mutant on reportMutantRunResult with a TimeoutMutantRunResult', () => {
      // Arrange
      const sut = createSut();

      // Act
      const actual = sut.reportMutantRunResult(
        createMutantTestCoverage({ mutant: factory.mutant({ fileName: 'add.js' }) }),
        factory.timeoutMutantRunResult()
      );

      // Assert
      const expected: Partial<TimeoutMutantResult> = {
        status: MutantStatus.TimedOut,
      };
      expect(actual).deep.include(expected);
    });

    it('should report an ignored mutant on reportMutantRunResult with a IgnoredMutantResult', () => {
      // Arrange
      const sut = createSut();

      // Act
      const actual = sut.reportMutantIgnored(factory.mutant({ fileName: 'add.js', ignoreReason: 'foo is ignored' }));

      // Assert
      const expected: Partial<IgnoredMutantResult> = {
        status: MutantStatus.Ignored,
        ignoreReason: 'foo is ignored',
      };
      expect(actual).deep.include(expected);
    });

    it('should report a survived mutant on reportMutantRunResult with a SurvivedMutantRunResult', () => {
      // Arrange
      dryRunResult.tests.push(factory.failedTestResult({ id: '1', name: 'foo should be bar' }));
      const sut = createSut();

      // Act
      const actual = sut.reportMutantRunResult(
        createMutantTestCoverage({ mutant: factory.mutant({ fileName: 'add.js' }), testFilter: ['1'] }),
        factory.survivedMutantRunResult({ nrOfTests: 4 })
      );

      // Assert
      const expected: Partial<UndetectedMutantResult> = {
        status: MutantStatus.Survived,
        testFilter: ['foo should be bar'],
        nrOfTestsRan: 4,
      };
      expect(actual).deep.include(expected);
    });

    it('should be able to report testFilter as `undefined` for a survived mutant', () => {
      // Arrange
      dryRunResult.tests.push(factory.failedTestResult({ id: '1', name: 'foo should be bar' }));
      const sut = createSut();

      // Act
      const actual = sut.reportMutantRunResult(
        createMutantTestCoverage({ mutant: factory.mutant({ fileName: 'add.js' }), testFilter: undefined }),
        factory.survivedMutantRunResult()
      );

      // Assert
      const expected: Partial<UndetectedMutantResult> = {
        status: MutantStatus.Survived,
        testFilter: undefined,
      };
      expect(actual).deep.include(expected);
    });
  });
});
