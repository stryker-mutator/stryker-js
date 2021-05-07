import sinon from 'sinon';
import { expect } from 'chai';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { CompleteDryRunResult } from '@stryker-mutator/api/test-runner';
import { Mutant, MutantStatus, MutantTestCoverage } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/report';

import { findMutantTestCoverage as sut } from '../../../src/mutants/find-mutant-test-coverage';
import { coreTokens } from '../../../src/di';

describe(sut.name, () => {
  let reporterMock: sinon.SinonStubbedInstance<Required<Reporter>>;

  beforeEach(() => {
    reporterMock = factory.reporter();
  });

  function act(dryRunResult: CompleteDryRunResult, mutants: Mutant[]) {
    return testInjector.injector
      .provideValue(coreTokens.reporter, reporterMock)
      .provideValue(coreTokens.dryRunResult, dryRunResult)
      .provideValue(coreTokens.mutants, mutants)
      .injectFunction(sut);
  }

  it('should not match ignored mutants to any tests', () => {
    const mutant = factory.mutant({ id: '2', status: MutantStatus.Ignored, statusReason: 'foo should ignore' });
    const dryRunResult = factory.completeDryRunResult({ mutantCoverage: { static: {}, perTest: { '1': { 2: 2 } } } });

    // Act
    const result = act(dryRunResult, [mutant]);

    // Assert
    const expected: MutantTestCoverage[] = [{ ...mutant, estimatedNetTime: 0, static: false }];
    expect(result).deep.eq(expected);
  });

  it('should mark mutant as "NoCoverage" when there is coverage data, but none for the specific mutant', () => {
    const mutant = factory.mutant({ id: '3' });
    const dryRunResult = factory.completeDryRunResult({ mutantCoverage: { static: {}, perTest: { '1': { 2: 2 } } } });

    // Act
    const result = act(dryRunResult, [mutant]);

    // Assert
    const expected: MutantTestCoverage[] = [{ ...mutant, estimatedNetTime: 0, static: false, coveredBy: [] }];
    expect(result).deep.eq(expected);
  });

  describe('without mutant coverage data', () => {
    it('should mark mutants as "static"', () => {
      // Arrange
      const mutant1 = factory.mutant({ id: '1' });
      const mutant2 = factory.mutant({ id: '2' });
      const mutants = [mutant1, mutant2];
      const dryRunResult = factory.completeDryRunResult({ mutantCoverage: undefined });

      // Act
      const result = act(dryRunResult, mutants);

      // Assert
      const expected: MutantTestCoverage[] = [
        { ...mutant1, estimatedNetTime: 0, coveredBy: undefined, static: true },
        { ...mutant2, estimatedNetTime: 0, coveredBy: undefined, static: true },
      ];
      expect(result).deep.eq(expected);
    });

    it('should calculate estimatedNetTime as the sum of all tests', () => {
      // Arrange
      const mutant1 = factory.mutant({ id: '1' });
      const mutants = [mutant1];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ timeSpentMs: 20 }), factory.successTestResult({ timeSpentMs: 22 })],
        mutantCoverage: undefined,
      });

      // Act
      const result = act(dryRunResult, mutants);

      // Assert
      expect(result[0].estimatedNetTime).eq(42);
    });

    it('should report onAllMutantsMatchedWithTests', () => {
      // Arrange
      const mutants = [
        factory.mutant({ id: '1', fileName: 'foo.js', mutatorName: 'fooMutator', replacement: '<=', location: { start: { line: 0, column: 0 }, end: { line: 0, column: 1 } } }),
        factory.mutant({ id: '2', fileName: 'bar.js', mutatorName: 'barMutator', replacement: '{}', location: { start: { line: 0, column: 2 }, end: { line: 0, column: 3 } } }),
      ];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ timeSpentMs: 20 }), factory.successTestResult({ timeSpentMs: 22 })],
        mutantCoverage: undefined,
      });

      // Act
      act(dryRunResult, mutants);

      // Assert
      expect(reporterMock.onAllMutantsMatchedWithTests).calledWithExactly([
        factory.mutantTestCoverage({
          id: '1',
          fileName: 'foo.js',
          mutatorName: 'fooMutator',
          replacement: '<=',
          static: true,
          estimatedNetTime: 42,
          location: { start: { line: 0, column: 0 }, end: { line: 0, column: 1 } },
        }),
        factory.mutantTestCoverage({
          id: '2',
          fileName: 'bar.js',
          mutatorName: 'barMutator',
          replacement: '{}',
          static: true,
          estimatedNetTime: 42,
          location: { start: { line: 0, column: 2 }, end: { line: 0, column: 3 } },
        }),
      ]);
    });
  });

  describe('with static coverage', () => {
    it('should disable test filtering', () => {
      // Arrange
      const mutant = factory.mutant({ id: '1' });
      const mutants = [mutant];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 0 })],
        mutantCoverage: { static: { 1: 1 }, perTest: {} },
      });

      // Act
      const result = act(dryRunResult, mutants);

      // Assert
      const expected: MutantTestCoverage[] = [{ ...mutant, estimatedNetTime: 0, static: true, coveredBy: undefined }];
      expect(result).deep.eq(expected);
    });

    it('should calculate estimatedNetTime as the sum of all tests', () => {
      // Arrange
      const mutant = factory.mutant({ id: '1' });
      const mutants = [mutant];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 20 }), factory.successTestResult({ id: 'spec1', timeSpentMs: 22 })],
        mutantCoverage: { static: { 1: 1 }, perTest: {} },
      });

      // Act
      const result = act(dryRunResult, mutants);

      // Assert
      expect(result[0].estimatedNetTime).eq(42);
    });

    it('should report onAllMutantsMatchedWithTests with correct `static` value', () => {
      // Arrange
      const mutants = [factory.mutant({ id: '1' }), factory.mutant({ id: '2' })];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult()],
        mutantCoverage: { static: { 1: 1 }, perTest: {} }, // mutant 2 has no coverage
      });

      // Act
      act(dryRunResult, mutants);

      // Assert
      const expectedFirstMatch: Partial<MutantTestCoverage> = {
        id: '1',
        static: true,
        coveredBy: undefined,
      };
      const expectedSecondMatch: Partial<MutantTestCoverage> = {
        id: '2',
        static: false,
        coveredBy: [],
      };
      expect(reporterMock.onAllMutantsMatchedWithTests).calledWithMatch([sinon.match(expectedFirstMatch), sinon.match(expectedSecondMatch)]);
    });
  });

  describe('with perTest coverage', () => {
    it('should enable test filtering for covered tests', () => {
      // Arrange
      const mutant1 = factory.mutant({ id: '1' });
      const mutant2 = factory.mutant({ id: '2' });
      const mutants = [mutant1, mutant2];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 0 }), factory.successTestResult({ id: 'spec2', timeSpentMs: 0 })],
        mutantCoverage: { static: { 1: 0 }, perTest: { spec1: { 1: 1 }, spec2: { 1: 0, 2: 1 } } },
      });

      // Act
      const result = act(dryRunResult, mutants);

      // Assert
      const expected: MutantTestCoverage[] = [
        { ...mutant1, estimatedNetTime: 0, coveredBy: ['spec1'], static: false },
        { ...mutant2, estimatedNetTime: 0, coveredBy: ['spec2'], static: false },
      ];
      expect(result).deep.eq(expected);
    });

    it('should calculate estimatedNetTime as the sum of covered tests', () => {
      // Arrange
      const mutant1 = factory.mutant({ id: '1' });
      const mutant2 = factory.mutant({ id: '2' });
      const mutants = [mutant1, mutant2];
      const dryRunResult = factory.completeDryRunResult({
        tests: [
          factory.successTestResult({ id: 'spec1', timeSpentMs: 20 }),
          factory.successTestResult({ id: 'spec2', timeSpentMs: 10 }),
          factory.successTestResult({ id: 'spec3', timeSpentMs: 22 }),
        ],
        mutantCoverage: { static: { 1: 0 }, perTest: { spec1: { 1: 1 }, spec2: { 1: 0, 2: 1 }, spec3: { 1: 2 } } },
      });

      // Act
      const actualMatches = act(dryRunResult, mutants);

      // Assert
      expect(actualMatches.find((mutant) => mutant.id === '1')?.estimatedNetTime).eq(42); // spec1 + spec3
      expect(actualMatches.find((mutant) => mutant.id === '2')?.estimatedNetTime).eq(10); // spec2
    });

    it('should report onAllMutantsMatchedWithTests with correct `testFilter` value', () => {
      // Arrange
      const mutants = [factory.mutant({ id: '1' }), factory.mutant({ id: '2' })];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 0 }), factory.successTestResult({ id: 'spec2', timeSpentMs: 0 })],
        mutantCoverage: { static: { 1: 0 }, perTest: { spec1: { 1: 1 }, spec2: { 1: 0, 2: 1 } } },
      });

      // Act
      act(dryRunResult, mutants);

      // Assert
      const expectedFirstMatch: Partial<MutantTestCoverage> = {
        id: '1',
        static: false,
        coveredBy: ['spec1'],
      };
      const expectedSecondMatch: Partial<MutantTestCoverage> = {
        id: '2',
        static: false,
        coveredBy: ['spec2'],
      };
      expect(reporterMock.onAllMutantsMatchedWithTests).calledWithMatch([sinon.match(expectedFirstMatch), sinon.match(expectedSecondMatch)]);
    });

    it('should allow for non-existing tests (#2485)', () => {
      // Arrange
      const mutant1 = factory.mutant({ id: '1' });
      const mutant2 = factory.mutant({ id: '2' });
      const mutants = [mutant1, mutant2];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 20 })], // test result for spec2 is missing
        mutantCoverage: { static: {}, perTest: { spec1: { 1: 1 }, spec2: { 1: 0, 2: 1 } } },
      });

      // Act
      const actualMatches = act(dryRunResult, mutants);

      // Assert
      expect(actualMatches.find((mutant) => mutant.id === '1')?.coveredBy).deep.eq(['spec1']);
      expect(actualMatches.find((mutant) => mutant.id === '2')?.coveredBy).lengthOf(0);
      expect(testInjector.logger.debug).calledWith(
        'Found test with id "spec2" in coverage data, but not in the test results of the dry run. Not taking coverage data for this test into account'
      );
    });
  });
});
