import { factory } from '@stryker-mutator/test-helpers';

import { expect } from 'chai';

import { findMutantTestCoverage as sut, MutantTestCoverage } from '../../../src/mutants/MutantTestMatcher2';

describe(sut.name, () => {
  describe('without mutant coverage data', () => {
    it('should disable test filtering', () => {
      // Arrange
      const mutant1 = factory.mutant({ id: 1 });
      const mutant2 = factory.mutant({ id: 2 });
      const mutants = [mutant1, mutant2];
      const dryRunResult = factory.completeDryRunResult({ mutantCoverage: undefined });

      // Act
      const result = sut(dryRunResult, mutants);

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
      const result = sut(dryRunResult, mutants);

      // Assert
      expect(result[0].estimatedNetTime).eq(42);
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
      const result = sut(dryRunResult, mutants);

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
      const result = sut(dryRunResult, mutants);

      // Assert
      expect(result[0].estimatedNetTime).eq(42);
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
      const result = sut(dryRunResult, mutants);

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
      const actualMatches = sut(dryRunResult, mutants);

      // Assert
      expect(actualMatches.find((mutant) => mutant.mutant.id === 1)?.estimatedNetTime).eq(42); // spec1 + spec3
      expect(actualMatches.find((mutant) => mutant.mutant.id === 2)?.estimatedNetTime).eq(10); // spec2
    });
  });
});
