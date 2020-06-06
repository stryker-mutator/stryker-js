import { Mutant, File } from '@stryker-mutator/api/core';
import { MatchedMutant } from '@stryker-mutator/api/report';
import { TestSelection } from '@stryker-mutator/api/test_framework';
import { CoverageCollection, CoveragePerTestResult, RunStatus, TestResult, TestStatus } from '@stryker-mutator/api/test_runner';
import { testInjector } from '@stryker-mutator/test-helpers';
import { mutant, testResult } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { coreTokens } from '../../../src/di';
import InputFileCollection from '../../../src/input/InputFileCollection';
import { MutantTestMatcher } from '../../../src/mutants/MutantTestMatcher';
import { InitialTestRunResult } from '../../../src/process/InitialTestExecutor';
import BroadcastReporter from '../../../src/reporters/BroadcastReporter';
import SourceFile from '../../../src/SourceFile';
import TestableMutant, { TestSelectionResult } from '../../../src/TestableMutant';
import { CoverageMapsByFile } from '../../../src/transpiler/CoverageInstrumenterTranspiler';
import { MappedLocation, PassThroughSourceMapper } from '../../../src/transpiler/SourceMapper';
import { Mock, mock } from '../../helpers/producers';

describe(MutantTestMatcher.name, () => {
  let sut: MutantTestMatcher;
  let mutants: Mutant[];
  let initialRunResult: InitialTestRunResult;
  let input: InputFileCollection;
  let fileCoverageDictionary: CoverageMapsByFile;
  let reporter: Mock<BroadcastReporter>;

  beforeEach(() => {
    mutants = [];
    fileCoverageDictionary = Object.create(null);
    initialRunResult = {
      coverageMaps: fileCoverageDictionary,
      overheadTimeMS: 42,
      runResult: { tests: [], status: RunStatus.Complete },
      sourceMapper: new PassThroughSourceMapper(),
    };
    reporter = mock(BroadcastReporter);
    input = new InputFileCollection(
      [new File('fileWithMutantOne', '\n\n\n\n12345'), new File('fileWithMutantTwo', '\n\n\n\n\n\n\n\n\n\n')],
      ['fileWithMutantOne', 'fileWithMutantTwo']
    );
    sinon.spy(initialRunResult.sourceMapper, 'transpiledLocationFor');
  });

  describe('with coverageAnalysis: "perTest"', () => {
    beforeEach(() => {
      testInjector.options.coverageAnalysis = 'perTest';
      sut = createSut();
    });

    describe('matchWithMutants(mutants)', () => {
      describe('with 2 mutants and 2 testResults', () => {
        let mutantOne: Mutant;
        let mutantTwo: Mutant;
        let testResultOne: TestResult;
        let testResultTwo: TestResult;

        beforeEach(() => {
          mutantOne = {
            fileName: 'fileWithMutantOne',
            mutatorName: 'myMutator',
            range: [9, 9], // line 4:5 -> line 4:5
            replacement: '>',
            // location: { start: { line: 4, column: 5 }, end: { line: 4, column: 5 } },
          };

          mutantTwo = {
            fileName: 'fileWithMutantTwo',
            mutatorName: 'myMutator',
            range: [9, 9], // line 9:0 -> line 9:0
            replacement: '<',
            // location: { start: { line: 9, column: 0 }, end: { line: 9, column: 0 } },
          };

          testResultOne = {
            name: 'test one',
            status: TestStatus.Success,
            timeSpentMs: 5,
          };
          testResultTwo = {
            name: 'test two',
            status: TestStatus.Success,
            timeSpentMs: 5,
          };
          initialRunResult.runResult.tests.push(testResultOne, testResultTwo);
          mutants.push(mutantOne);
          mutants.push(mutantTwo);
        });

        describe('without code coverage info', () => {
          it('should run all tests for the mutants and report failure', async () => {
            const result = await sut.matchWithMutants(mutants);

            expect(result[0].runAllTests).true;
            expect(result[1].runAllTests).true;
            expect(TestSelectionResult[result[0].testSelectionResult]).eq(TestSelectionResult[TestSelectionResult.FailedButAlreadyReported]);
            expect(TestSelectionResult[result[1].testSelectionResult]).eq(TestSelectionResult[TestSelectionResult.FailedButAlreadyReported]);
            expect(testInjector.logger.warn).calledWith(
              'No coverage result found, even though coverageAnalysis is "%s". Assuming that all tests cover each mutant. This might have a big impact on the performance.',
              'perTest'
            );
          });

          it('should have both mutants matched', async () => {
            const result = await sut.matchWithMutants(mutants);

            const matchedMutants: MatchedMutant[] = [
              {
                fileName: result[0].fileName,
                id: '0',
                mutatorName: result[0].mutatorName,
                replacement: result[0].replacement,
                runAllTests: true,
                scopedTestIds: [],
                timeSpentScopedTests: result[0].timeSpentScopedTests,
              },
              {
                fileName: result[1].fileName,
                id: '1',
                mutatorName: result[1].mutatorName,
                replacement: result[1].replacement,
                runAllTests: true,
                scopedTestIds: [],
                timeSpentScopedTests: result[1].timeSpentScopedTests,
              },
            ];

            expect(reporter.onAllMutantsMatchedWithTests).calledWith(Object.freeze(matchedMutants));
          });
        });

        describe('without the tests having covered the mutants', () => {
          beforeEach(() => {
            const covCollectionPerFile: CoveragePerTestResult = {
              baseline: {},
              deviations: {
                0: {
                  anOtherFile: { s: { 1: 1 }, f: {} }, // covers, but in wrong src file
                },
                1: {
                  fileWithMutantOne: { s: { 1: 1, 2: 1, 3: 0 }, f: {} }, // Covers, but not smallest statement based on column
                  fileWithMutantTwo: { s: { 1: 1, 2: 0, 3: 1 }, f: {} }, // Covers, but not smallest statement based on row number
                },
              },
            };
            initialRunResult.runResult.coverage = covCollectionPerFile;

            fileCoverageDictionary.anOtherFile = {
              fnMap: {},
              statementMap: {
                1: {
                  // covers but in wrong src file
                  end: { line: 4, column: 7 },
                  start: { line: 4, column: 0 },
                },
              },
            };
            fileCoverageDictionary.fileWithMutantOne = {
              fnMap: {},
              statementMap: {
                1: {
                  end: { line: 4, column: 9 },
                  start: { line: 2, column: 0 },
                },
                2: {
                  end: { line: 4, column: 9 },
                  start: { line: 4, column: 0 },
                },
                3: {
                  // Smallest statement that surrounds the mutant. Differs based on column number
                  end: { line: 4, column: 7 },
                  start: { line: 4, column: 3 },
                },
              },
            };
            fileCoverageDictionary.fileWithMutantTwo = {
              fnMap: {},
              statementMap: {
                1: {
                  end: { line: 9, column: 4 },
                  start: { line: 0, column: 0 },
                },
                2: {
                  // Smallest  statement that surround the mutant. Differs based on line number
                  end: { line: 9, column: 4 },
                  start: { line: 8, column: 0 },
                },
                3: {
                  end: { line: 9, column: 4 },
                  start: { line: 9, column: 1 },
                },
              },
            };
          });

          it('should not have added the run results to the mutants', async () => {
            const result = await sut.matchWithMutants(mutants);

            expect(result[0].selectedTests).lengthOf(0);
            expect(result[1].selectedTests).lengthOf(0);
          });
        });

        describe('with tests having covered the mutants based on statements', () => {
          beforeEach(() => {
            fileCoverageDictionary.fileWithMutantOne = {
              fnMap: {},
              statementMap: {
                1: { start: { line: 4, column: 0 }, end: { line: 6, column: 0 } },
              },
            };
            fileCoverageDictionary.fileWithMutantTwo = {
              fnMap: {},
              statementMap: {
                1: { start: { line: 0, column: 0 }, end: { line: 10, column: 0 } },
              },
            };

            initialRunResult.runResult.coverage = {
              baseline: {},
              deviations: {
                0: {
                  fileWithMutantOne: { s: { 1: 1 }, f: {} },
                  fileWithMutantTwo: { s: { 1: 1 }, f: {} },
                },
                1: {
                  fileWithMutantOne: { s: { 1: 1 }, f: {} },
                },
              },
            };
            sut = createSut();
          });

          it('should have added the run results to the mutants', async () => {
            const expectedTestSelectionFirstMutant: TestSelection[] = [
              { id: 0, name: 'test one' },
              { id: 1, name: 'test two' },
            ];

            const result = await sut.matchWithMutants(mutants);

            const expectedTestSelectionSecondMutant: TestSelection[] = [{ id: 0, name: 'test one' }];
            expect(result[0].selectedTests).deep.eq(expectedTestSelectionFirstMutant);
            expect(result[1].selectedTests).deep.eq(expectedTestSelectionSecondMutant);
            expect(result[0].testSelectionResult).deep.eq(TestSelectionResult.Success);
            expect(result[1].testSelectionResult).deep.eq(TestSelectionResult.Success);
          });
        });

        describe('without matching statements or functions', () => {
          beforeEach(() => {
            fileCoverageDictionary.fileWithMutantOne = { statementMap: {}, fnMap: {} };
            fileCoverageDictionary.fileWithMutantTwo = { statementMap: {}, fnMap: {} };
            initialRunResult.runResult.coverage = { baseline: {}, deviations: {} };
            sut = createSut();
          });

          it('should select all test in the test run but not report the error yet', async () => {
            const result = await sut.matchWithMutants(mutants);

            expect(result[0].runAllTests).true;
            expect(result[1].runAllTests).true;
            expect(result[0].testSelectionResult).eq(TestSelectionResult.Failed);
            expect(result[1].testSelectionResult).eq(TestSelectionResult.Failed);
            expect(testInjector.logger.warn).not.called;
          });
        });

        describe('with a mutant being covered using function coverage', () => {
          beforeEach(() => {
            fileCoverageDictionary.fileWithMutantOne = {
              fnMap: {
                1: { start: { line: 4, column: 0 }, end: { line: 6, column: 0 } },
              },
              statementMap: {},
            };
            fileCoverageDictionary.fileWithMutantTwo = { statementMap: {}, fnMap: {} };
            initialRunResult.runResult.coverage = {
              baseline: {},
              deviations: { 0: { fileWithMutantOne: { s: {}, f: { 1: 1 } } } },
            };
            sut = createSut();
          });

          it('should have added the run results to the mutant', async () => {
            const expectedTestSelection = [{ id: 0, name: 'test one' }];

            const result = await sut.matchWithMutants(mutants);

            expect(result[0].selectedTests).deep.eq(expectedTestSelection);
          });
        });

        describe('with baseline covering a mutant', () => {
          beforeEach(() => {
            fileCoverageDictionary.fileWithMutantOne = {
              fnMap: {},
              statementMap: {
                1: { start: { line: 4, column: 0 }, end: { line: 6, column: 0 } },
              },
            };
            fileCoverageDictionary.fileWithMutantTwo = {
              fnMap: {},
              statementMap: {
                1: { start: { line: 10, column: 0 }, end: { line: 10, column: 0 } },
              },
            };
            initialRunResult.runResult.coverage = {
              baseline: {
                fileWithMutantOne: { s: { 1: 1 }, f: {} },
              },
              deviations: {},
            };
            sut = createSut();
          });

          it('should add all test results to the mutant that is covered by the baseline', async () => {
            const result = await sut.matchWithMutants(mutants);

            expect(result[0].runAllTests).true;
            expect(result[1].runAllTests).true;
          });
        });
      });
    });

    describe('should not result in regression', () => {
      it('should match up mutant for issue #151 (https://github.com/stryker-mutator/stryker/issues/151)', async () => {
        // Arrange
        const sourceFile = new SourceFile(new File('', ''));
        sourceFile.getLocation = () => ({ start: { line: 13, column: 38 }, end: { line: 24, column: 5 } });
        const testableMutant = new TestableMutant(
          '1',
          mutant({
            fileName: 'juice-shop\\app\\js\\controllers\\SearchResultController.js',
          }),
          sourceFile
        );

        const coverageResult: CoverageCollection = {
          'juice-shop\\app\\js\\controllers\\SearchResultController.js': {
            s: {
              1: 1,
              2: 1,
              3: 1,
              4: 0,
              5: 1,
              6: 0,
              7: 0,
              8: 0,
              9: 0,
              10: 0,
              11: 0,
              12: 0,
              13: 0,
              14: 0,
              15: 0,
              16: 0,
              17: 0,
              18: 0,
              19: 0,
              20: 0,
              21: 0,
              22: 0,
              23: 0,
              24: 0,
              25: 0,
              26: 0,
              27: 0,
              28: 0,
              29: 0,
              30: 0,
              31: 0,
              32: 1,
              33: 1,
              34: 1,
              35: 1,
              36: 0,
              37: 0,
            },
            f: {},
          },
        };

        fileCoverageDictionary['juice-shop\\app\\js\\controllers\\SearchResultController.js'] = {
          statementMap: {
            1: { start: { line: 1, column: 0 }, end: { line: 84, column: 5 } },
            2: { start: { line: 13, column: 4 }, end: { line: 24, column: 5 } },
            3: { start: { line: 14, column: 6 }, end: { line: 23, column: 8 } },
            4: { start: { line: 20, column: 12 }, end: { line: 20, column: 21 } },
            5: { start: { line: 26, column: 4 }, end: { line: 72, column: 5 } },
            6: { start: { line: 27, column: 6 }, end: { line: 71, column: 8 } },
            7: { start: { line: 28, column: 8 }, end: { line: 28, column: 51 } },
            8: { start: { line: 29, column: 8 }, end: { line: 29, column: 25 } },
            9: { start: { line: 30, column: 8 }, end: { line: 53, column: 9 } },
            10: { start: { line: 31, column: 10 }, end: { line: 52, column: 11 } },
            11: { start: { line: 32, column: 12 }, end: { line: 32, column: 24 } },
            12: { start: { line: 33, column: 12 }, end: { line: 50, column: 14 } },
            13: { start: { line: 34, column: 14 }, end: { line: 34, column: 68 } },
            14: { start: { line: 35, column: 14 }, end: { line: 47, column: 16 } },
            15: { start: { line: 36, column: 16 }, end: { line: 44, column: 18 } },
            16: { start: { line: 37, column: 18 }, end: { line: 41, column: 20 } },
            17: { start: { line: 38, column: 20 }, end: { line: 38, column: 62 } },
            18: { start: { line: 40, column: 20 }, end: { line: 40, column: 55 } },
            19: { start: { line: 43, column: 18 }, end: { line: 43, column: 34 } },
            20: { start: { line: 46, column: 16 }, end: { line: 46, column: 32 } },
            21: { start: { line: 49, column: 14 }, end: { line: 49, column: 30 } },
            22: { start: { line: 51, column: 12 }, end: { line: 51, column: 17 } },
            23: { start: { line: 54, column: 8 }, end: { line: 68, column: 9 } },
            24: { start: { line: 55, column: 10 }, end: { line: 67, column: 12 } },
            25: { start: { line: 56, column: 12 }, end: { line: 64, column: 14 } },
            26: { start: { line: 57, column: 14 }, end: { line: 61, column: 16 } },
            27: { start: { line: 58, column: 16 }, end: { line: 58, column: 54 } },
            28: { start: { line: 60, column: 16 }, end: { line: 60, column: 51 } },
            29: { start: { line: 63, column: 14 }, end: { line: 63, column: 30 } },
            30: { start: { line: 66, column: 12 }, end: { line: 66, column: 28 } },
            31: { start: { line: 70, column: 8 }, end: { line: 70, column: 24 } },
            32: { start: { line: 74, column: 4 }, end: { line: 74, column: 63 } },
            33: { start: { line: 76, column: 4 }, end: { line: 83, column: 6 } },
            34: { start: { line: 77, column: 6 }, end: { line: 77, column: 37 } },
            35: { start: { line: 78, column: 6 }, end: { line: 80, column: 7 } },
            36: { start: { line: 79, column: 8 }, end: { line: 79, column: 89 } },
            37: { start: { line: 82, column: 6 }, end: { line: 82, column: 22 } },
          },
          fnMap: {},
        };

        initialRunResult.runResult.coverage = { baseline: {}, deviations: { 0: coverageResult } };
        initialRunResult.runResult.tests.push({
          name: 'controllers SearchResultController should open a modal dialog with product details',
          status: TestStatus.Success,
          timeSpentMs: 5,
        });
        sut = createSut();

        // Act
        await sut.enrichWithCoveredTests(testableMutant);

        // Assert
        expect(testableMutant.selectedTests).deep.eq([
          {
            id: 0,
            name: 'controllers SearchResultController should open a modal dialog with product details',
          },
        ]);
      });
    });
  });

  describe('with coverageAnalysis: "all"', () => {
    beforeEach(() => {
      testInjector.options.coverageAnalysis = 'all';
      sut = createSut();
    });

    it('should match all mutants to all tests and log a warning when there is no coverage data', async () => {
      mutants.push(mutant({ fileName: 'fileWithMutantOne' }), mutant({ fileName: 'fileWithMutantTwo' }));
      initialRunResult.runResult.tests.push(testResult(), testResult());

      const result = await sut.matchWithMutants(mutants);

      expect(result[0].runAllTests).true;
      expect(result[1].runAllTests).true;
      expect(result[0].testSelectionResult).deep.eq(TestSelectionResult.FailedButAlreadyReported);
      expect(result[1].testSelectionResult).deep.eq(TestSelectionResult.FailedButAlreadyReported);
      expect(testInjector.logger.warn).to.have.been.calledWith(
        'No coverage result found, even though coverageAnalysis is "%s". Assuming that all tests cover each mutant. This might have a big impact on the performance.',
        'all'
      );
    });

    describe('when there is coverage data', () => {
      beforeEach(() => {
        initialRunResult.runResult.coverage = {
          fileWithMutantOne: { s: { 0: 1 }, f: {} },
        };
        fileCoverageDictionary.fileWithMutantOne = {
          fnMap: {},
          statementMap: {
            0: { start: { line: 0, column: 0 }, end: { line: 6, column: 0 } },
          },
        };
      });

      it('should retrieves source mapped location', async () => {
        // Arrange
        mutants.push(mutant({ fileName: 'fileWithMutantOne', range: [4, 5] }));

        // Act
        await sut.matchWithMutants(mutants);

        // Assert
        const expectedLocation: MappedLocation = {
          fileName: 'fileWithMutantOne',
          location: {
            end: { line: 4, column: 1 },
            start: { line: 4, column: 0 },
          },
        };
        expect(initialRunResult.sourceMapper.transpiledLocationFor).calledWith(expectedLocation);
      });

      it('should match mutant to single test result', async () => {
        // Arrange
        mutants.push(mutant({ fileName: 'fileWithMutantOne', range: [4, 5] }));
        initialRunResult.runResult.tests.push(testResult({ name: 'test 1' }), testResult({ name: 'test 2' }));

        // Act
        const result = await sut.matchWithMutants(mutants);

        // Assert
        const expectedTestSelection: TestSelection[] = [
          {
            id: 0,
            name: 'test 1',
          },
          {
            id: 1,
            name: 'test 2',
          },
        ];
        expect(result).lengthOf(1);
        expect(result[0].selectedTests).deep.eq(expectedTestSelection);
      });
    });
  });

  describe('with coverageAnalysis: "off"', () => {
    beforeEach(() => {
      testInjector.options.coverageAnalysis = 'off';
      sut = createSut();
    });

    it('should match all mutants to all tests', async () => {
      mutants.push(mutant({ fileName: 'fileWithMutantOne' }), mutant({ fileName: 'fileWithMutantTwo' }));
      initialRunResult.runResult.tests.push(testResult(), testResult());

      const result = await sut.matchWithMutants(mutants);

      expect(result[0].runAllTests).true;
      expect(result[1].runAllTests).true;
    });
  });

  function createSut() {
    return testInjector.injector
      .provideValue(coreTokens.inputFiles, input)
      .provideValue(coreTokens.initialRunResult, initialRunResult)
      .provideValue(coreTokens.reporter, reporter)
      .injectClass(MutantTestMatcher);
  }
});
