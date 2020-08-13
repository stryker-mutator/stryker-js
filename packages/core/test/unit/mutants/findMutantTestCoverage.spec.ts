import sinon from 'sinon';
import { expect } from 'chai';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { CompleteDryRunResult } from '@stryker-mutator/api/test_runner2';
import { Mutant } from '@stryker-mutator/api/core';
import { Reporter, MatchedMutant } from '@stryker-mutator/api/report';

import { findMutantTestCoverage as sut, MutantTestCoverage } from '../../../src/mutants/findMutantTestCoverage';
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

  describe('without mutant coverage data', () => {
    it('should disable test filtering', () => {
      // Arrange
      const mutant1 = factory.mutant({ id: 1 });
      const mutant2 = factory.mutant({ id: 2 });
      const mutants = [mutant1, mutant2];
      const dryRunResult = factory.completeDryRunResult({ mutantCoverage: undefined });

      // Act
      const result = act(dryRunResult, mutants);

      // Assert
      const expected: MutantTestCoverage[] = [
        { mutant: mutant1, estimatedNetTime: 0, testFilter: undefined, coveredByTests: true },
        { mutant: mutant2, estimatedNetTime: 0, testFilter: undefined, coveredByTests: true },
      ];
      expect(result).deep.eq(expected);
    });

    it('should calculate estimatedNetTime as the sum of all tests', () => {
      // Arrange
      const mutant1 = factory.mutant({ id: 1 });
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
        factory.mutant({ id: 1, fileName: 'foo.js', mutatorName: 'fooMutator', replacement: '<=' }),
        factory.mutant({ id: 2, fileName: 'bar.js', mutatorName: 'barMutator', replacement: '{}' }),
      ];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ timeSpentMs: 20 }), factory.successTestResult({ timeSpentMs: 22 })],
        mutantCoverage: undefined,
      });

      // Act
      act(dryRunResult, mutants);

      // Assert
      expect(reporterMock.onAllMutantsMatchedWithTests).calledWithExactly([
        factory.matchedMutant({
          id: '1',
          fileName: 'foo.js',
          mutatorName: 'fooMutator',
          replacement: '<=',
          runAllTests: true,
          testFilter: undefined,
          timeSpentScopedTests: 42,
        }),
        factory.matchedMutant({
          id: '2',
          fileName: 'bar.js',
          mutatorName: 'barMutator',
          replacement: '{}',
          runAllTests: true,
          testFilter: undefined,
          timeSpentScopedTests: 42,
        }),
      ]);
    });
  });

  describe('with static coverage', () => {
    it('should disable test filtering', () => {
      // Arrange
      const mutant = factory.mutant({ id: 1 });
      const mutants = [mutant];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 0 })],
        mutantCoverage: { static: { 1: 1 }, perTest: {} },
      });

      // Act
      const result = act(dryRunResult, mutants);

      // Assert
      const expected: MutantTestCoverage[] = [{ mutant, estimatedNetTime: 0, testFilter: undefined, coveredByTests: true }];
      expect(result).deep.eq(expected);
    });

    it('should calculate estimatedNetTime as the sum of all tests', () => {
      // Arrange
      const mutant = factory.mutant({ id: 1 });
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

    it('should report onAllMutantsMatchedWithTests with correct `runAllTests` value', () => {
      // Arrange
      const mutants = [factory.mutant({ id: 1 }), factory.mutant({ id: 2 })];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult()],
        mutantCoverage: { static: { 1: 1 }, perTest: {} },
      });

      // Act
      act(dryRunResult, mutants);

      // Assert
      const expectedFirstMatch: Partial<MatchedMutant> = {
        id: '1',
        runAllTests: true,
        testFilter: undefined,
      };
      const expectedSecondMatch: Partial<MatchedMutant> = {
        id: '2',
        runAllTests: false,
        testFilter: undefined,
      };
      expect(reporterMock.onAllMutantsMatchedWithTests).calledWithMatch([sinon.match(expectedFirstMatch), sinon.match(expectedSecondMatch)]);
    });
  });

  describe('with perTest coverage', () => {
    it('should enable test filtering for covered tests', () => {
      // Arrange
      const mutant1 = factory.mutant({ id: 1 });
      const mutant2 = factory.mutant({ id: 2 });
      const mutants = [mutant1, mutant2];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 0 }), factory.successTestResult({ id: 'spec2', timeSpentMs: 0 })],
        mutantCoverage: { static: { 1: 0 }, perTest: { spec1: { 1: 1 }, spec2: { 1: 0, 2: 1 } } },
      });

      // Act
      const result = act(dryRunResult, mutants);

      // Assert
      const expected: MutantTestCoverage[] = [
        { mutant: mutant1, estimatedNetTime: 0, testFilter: ['spec1'], coveredByTests: true },
        { mutant: mutant2, estimatedNetTime: 0, testFilter: ['spec2'], coveredByTests: true },
      ];
      expect(result).deep.eq(expected);
    });

    it('should calculate estimatedNetTime as the sum of covered tests', () => {
      // Arrange
      const mutant1 = factory.mutant({ id: 1 });
      const mutant2 = factory.mutant({ id: 2 });
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
      expect(actualMatches.find((mutant) => mutant.mutant.id === 1)?.estimatedNetTime).eq(42); // spec1 + spec3
      expect(actualMatches.find((mutant) => mutant.mutant.id === 2)?.estimatedNetTime).eq(10); // spec2
    });

    it('should report onAllMutantsMatchedWithTests with correct `testFilter` value', () => {
      // Arrange
      const mutants = [factory.mutant({ id: 1 }), factory.mutant({ id: 2 })];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 0 }), factory.successTestResult({ id: 'spec2', timeSpentMs: 0 })],
        mutantCoverage: { static: { 1: 0 }, perTest: { spec1: { 1: 1 }, spec2: { 1: 0, 2: 1 } } },
      });

      // Act
      act(dryRunResult, mutants);

      // Assert
      const expectedFirstMatch: Partial<MatchedMutant> = {
        id: '1',
        runAllTests: false,
        testFilter: ['spec1'],
      };
      const expectedSecondMatch: Partial<MatchedMutant> = {
        id: '2',
        runAllTests: false,
        testFilter: ['spec2'],
      };
      expect(reporterMock.onAllMutantsMatchedWithTests).calledWithMatch([sinon.match(expectedFirstMatch), sinon.match(expectedSecondMatch)]);
    });
  });
});
