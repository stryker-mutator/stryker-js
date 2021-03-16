import sinon from 'sinon';
import { File, Location, MutantResult, MutantStatus, Range, schema } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/report';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import * as strykerUtil from '@stryker-mutator/util';
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
  let requireResolveStub: sinon.SinonStub<Parameters<typeof strykerUtil.requireResolve>, ReturnType<typeof strykerUtil.requireResolve>>;

  beforeEach(() => {
    requireResolveStub = sinon.stub(strykerUtil, 'requireResolve');
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

    it('should add the project root', () => {
      const [actualReport] = actReportAll([]);
      expect(actualReport.projectRoot).eq(process.cwd());
    });

    describe('config', () => {
      it('should report config', () => {
        const [actualReport] = actReportAll([]);
        expect(actualReport.config).eq(testInjector.options);
      });
    });

    describe('framework', () => {
      it('should report "name", "version" and "branding"', () => {
        const expected: Pick<schema.FrameworkInformation, 'branding' | 'name' | 'version'> = {
          name: 'StrykerJS',
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          version: require('../../../../package.json').version,
          branding: {
            homepageUrl: 'https://stryker-mutator.io',
            imageUrl:
              "data:image/svg+xml;utf8,%3Csvg viewBox='0 0 1458 1458' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd' clip-rule='evenodd' stroke-linejoin='round' stroke-miterlimit='2'%3E%3Cpath fill='none' d='M0 0h1458v1458H0z'/%3E%3CclipPath id='a'%3E%3Cpath d='M0 0h1458v1458H0z'/%3E%3C/clipPath%3E%3Cg clip-path='url(%23a)'%3E%3Cpath d='M1458 729c0 402.655-326.345 729-729 729S0 1131.655 0 729C0 326.445 326.345 0 729 0s729 326.345 729 729' fill='%23e74c3c' fill-rule='nonzero'/%3E%3Cpath d='M778.349 1456.15L576.6 1254.401l233-105 85-78.668v-64.332l-257-257-44-187-50-208 251.806-82.793L1076.6 389.401l380.14 379.15c-19.681 367.728-311.914 663.049-678.391 687.599z' fill-opacity='.3'/%3E%3Cpath d='M753.4 329.503c41.79 0 74.579 7.83 97.925 25.444 23.571 18.015 41.69 43.956 55.167 77.097l11.662 28.679 165.733-58.183-14.137-32.13c-26.688-60.655-64.896-108.61-114.191-144.011-49.329-35.423-117.458-54.302-204.859-54.302-50.78 0-95.646 7.376-134.767 21.542-40.093 14.671-74.09 34.79-102.239 60.259-28.84 26.207-50.646 57.06-65.496 92.701-14.718 35.052-22.101 72.538-22.101 112.401 0 72.536 20.667 133.294 61.165 182.704 38.624 47.255 98.346 88.037 179.861 121.291 42.257 17.475 78.715 33.125 109.227 46.994 27.193 12.361 49.294 26.124 66.157 41.751 15.309 14.186 26.497 30.584 33.63 49.258 7.721 20.214 11.16 45.69 11.16 76.402 0 28.021-4.251 51.787-13.591 71.219-8.832 18.374-20.171 33.178-34.523 44.219-14.787 11.374-31.193 19.591-49.393 24.466-19.68 5.359-39.14 7.993-58.69 7.993-29.359 0-54.387-3.407-75.182-10.747-20.112-7.013-37.144-16.144-51.259-27.486-13.618-11.009-24.971-23.766-33.744-38.279-9.64-15.8-17.272-31.924-23.032-48.408l-10.965-31.376-161.669 60.585 10.734 30.124c10.191 28.601 24.197 56.228 42.059 82.748 18.208 27.144 41.322 51.369 69.525 72.745 27.695 21.075 60.904 38.218 99.481 51.041 37.777 12.664 82.004 19.159 132.552 19.159 49.998 0 95.818-8.321 137.611-24.622 42.228-16.471 78.436-38.992 108.835-67.291 30.719-28.597 54.631-62.103 71.834-100.642 17.263-38.56 25.923-79.392 25.923-122.248 0-54.339-8.368-100.37-24.208-138.32-16.29-38.759-38.252-71.661-65.948-98.797-26.965-26.418-58.269-48.835-93.858-67.175-33.655-17.241-69.196-33.11-106.593-47.533-35.934-13.429-65.822-26.601-89.948-39.525-22.153-11.868-40.009-24.21-53.547-37.309-11.429-11.13-19.83-23.678-24.718-37.664-5.413-15.49-7.98-33.423-7.98-53.577 0-40.883 11.293-71.522 37.086-90.539 28.443-20.825 64.985-30.658 109.311-30.658z' fill='%23f1c40f' fill-rule='nonzero'/%3E%3Cpath d='M720 0h18v113h-18zM1458 738v-18h-113v18h113zM720 1345h18v113h-18zM113 738v-18H0v18h113z'/%3E%3C/g%3E%3C/svg%3E",
          },
        };
        const [actualReport] = actReportAll([]);
        expect(actualReport.framework).deep.include(expected);
      });

      it('should report "dependencies"', () => {
        // Arrange
        const expectedDependencies: schema.Dependencies = {
          '@stryker-mutator/mocha-runner': '1.0.1',
          '@stryker-mutator/karma-runner': '1.0.2',
          '@stryker-mutator/jasmine-runner': '1.0.3',
          '@stryker-mutator/jest-runner': '1.0.4',
          '@stryker-mutator/typescript-checker': '1.0.5',
          karma: '1.0.6',
          'karma-chai': '1.0.7',
          'karma-chrome-launcher': '1.0.8',
          'karma-jasmine': '1.0.9',
          'karma-mocha': '1.0.10',
          mocha: '1.0.11',
          jasmine: '1.0.12',
          'jasmine-core': '1.0.13',
          jest: '1.0.14',
          'react-scripts': '1.0.15',
          typescript: '1.0.16',
          '@angular/cli': '1.0.17',
          webpack: '1.0.18',
          'webpack-cli': '1.0.19',
          'ts-jest': '1.0.20',
        };
        Object.entries(expectedDependencies).forEach(([dep, version]) => requireResolveStub.withArgs(`${dep}/package.json`).returns({ version }));

        // Act
        const [actualReport] = actReportAll([]);

        // Assert
        expect(actualReport.framework?.dependencies).deep.eq(expectedDependencies);
      });

      it('should ignore dependencies that could not be found', () => {
        // Arrange
        requireResolveStub.withArgs('karma/package.json').returns({ version: '2.3.4' });
        requireResolveStub.withArgs('typescript/package.json').throws(new Error('[MODULE_NOT_FOUND]: Cannot find module "typescript"'));

        // Act
        const [actualReport] = actReportAll([]);

        // Assert
        expect(actualReport.framework?.dependencies).deep.eq({ karma: '2.3.4' });
      });
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
