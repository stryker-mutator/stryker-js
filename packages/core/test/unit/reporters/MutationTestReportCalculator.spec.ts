import { expect } from 'chai';
import { MutationTestReportCalculator } from '../../../src/reporters/MutationTestReportCalculator';
import { TEST_INJECTOR, factory } from '@stryker-mutator/test-helpers';
import { coreTokens } from '../../../src/di';
import { Reporter, mutationTestReportSchema, MutantResult, MutantStatus } from '@stryker-mutator/api/report';
import InputFileCollection from '../../../src/input/InputFileCollection';
import { File } from '@stryker-mutator/api/core';

describe(MutationTestReportCalculator.name, () => {

  let reporterMock: sinon.SinonStubbedInstance<Required<Reporter>>;
  let sut: MutationTestReportCalculator;
  let inputFiles: InputFileCollection;
  let files: File[];

  beforeEach(() => {
    reporterMock = factory.reporter();
    files = [];
    inputFiles = {
      files,
      filesToMutate: [],
      logFiles: () => { }
    };
    sut = TEST_INJECTOR.injector
      .provideValue(coreTokens.Reporter, reporterMock as Required<Reporter>)
      .provideValue(coreTokens.InputFiles, inputFiles)
      .injectClass(MutationTestReportCalculator);
  });

  it('should report "mutationTestReportReady"', () => {
    sut.report([]);
    expect(reporterMock.onMutationTestReportReady).calledOnce;
  });

  it('should copy thresholds', () => {
    const actualReport = actReport();
    expect(actualReport.thresholds).eq(TEST_INJECTOR.options.thresholds);
  });

  it('should set correct schema version', () => {
    const actualReport = actReport();
    expect(actualReport.schemaVersion).eq('1.0');
  });

  it('should correctly map file properties', () => {
    // Arrange
    files.push(new File('foo.js', 'foo content'));
    files.push(new File('bar.html', 'bar content'));
    files.push(new File('baz.vue', 'baz content'));
    files.push(new File('qux.ts', 'qux content'));
    files.push(new File('corge.tsx', 'corge content'));
    const inputMutants = files.map(file => factory.MUTANT_RESULT({ sourceFilePath: file.name }));

    // Act
    const actualReport = actReport(inputMutants);

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
      factory.MUTANT_RESULT({
        id: '1',
        mutatorName: 'Foo',
        replacement: 'foo replacement',
        sourceFilePath: 'foo.js',
        status: MutantStatus.Killed
      }),
      factory.MUTANT_RESULT({
        sourceFilePath: 'bar.js',
        status: MutantStatus.NoCoverage
      }),
      factory.MUTANT_RESULT({
        sourceFilePath: 'baz.js',
        status: MutantStatus.RuntimeError
      }),
      factory.MUTANT_RESULT({
        sourceFilePath: 'qux.js',
        status: MutantStatus.Survived
      }),
      factory.MUTANT_RESULT({
        sourceFilePath: '5.js',
        status: MutantStatus.TimedOut
      }),
      factory.MUTANT_RESULT({
        sourceFilePath: '6.js',
        status: MutantStatus.TranspileError
      })
    ];
    files.push(...inputMutants.map(m => new File(m.sourceFilePath, '')));

    // Act
    const actualReport = actReport(inputMutants);

    // Assert
    expect(Object.keys(actualReport.files)).lengthOf(6);
    expect(actualReport.files['foo.js'].mutants[0]).include({
      id: '1',
      mutatorName: 'Foo',
      replacement: 'foo replacement',
      status: mutationTestReportSchema.MutantStatus.Killed
    });
    expect(actualReport.files['bar.js'].mutants[0]).include({ status: mutationTestReportSchema.MutantStatus.NoCoverage });
    expect(actualReport.files['baz.js'].mutants[0]).include({ status: mutationTestReportSchema.MutantStatus.RuntimeError });
    expect(actualReport.files['qux.js'].mutants[0]).include({ status: mutationTestReportSchema.MutantStatus.Survived });
    expect(actualReport.files['5.js'].mutants[0]).include({ status: mutationTestReportSchema.MutantStatus.Timeout });
    expect(actualReport.files['6.js'].mutants[0]).include({ status: mutationTestReportSchema.MutantStatus.CompileError });
  });

  it('should offset location correctly', () => {
    const inputMutants = [factory.MUTANT_RESULT({ location: { end: { line: 3, column: 4 }, start: { line: 1, column: 2 } } })];
    files.push(...inputMutants.map(m => new File(m.sourceFilePath, '')));
    const actualReport = actReport(inputMutants);
    expect(actualReport.files[''].mutants[0].location).deep.eq({ end: { line: 4, column: 5 }, start: { line: 2, column: 3 } });
  });

  it('should group mutants by file name', () => {
    // Arrange
    const inputMutants = [
      factory.MUTANT_RESULT({
        mutatorName: 'Foo',
        sourceFilePath: 'foo.js'
      }),
      factory.MUTANT_RESULT({
        mutatorName: 'Bar',
        sourceFilePath: 'foo.js'
      })
    ];
    files.push(new File('foo.js', ''));

    // Act
    const actualReport = actReport(inputMutants);

    // Assert
    expect(Object.keys(actualReport.files)).lengthOf(1);
    expect(actualReport.files['foo.js'].mutants).lengthOf(2);
  });

  it('should log a warning if source file could not be found', () => {
    const inputMutants = [factory.MUTANT_RESULT({ sourceFilePath: 'not-found.js' })];
    const actualReport = actReport(inputMutants);
    expect(Object.keys(actualReport.files)).lengthOf(0);
    expect(TEST_INJECTOR.logger.warn).calledWithMatch('File "not-found.js" not found');
  });

  function actReport(input: ReadonlyArray<MutantResult> = []): mutationTestReportSchema.MutationTestResult {
    sut.report(input);
    return reporterMock.onMutationTestReportReady.firstCall.args[0];
  }
});
