import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { TestCoverage } from '../../../src/mutants/index.js';

describe(TestCoverage.name, () => {
  describe(TestCoverage.prototype.hasStaticCoverage.name, () => {
    it('should return false when no static coverage was reported', () => {
      expect(TestCoverage.from(factory.completeDryRunResult(), testInjector.logger).hasStaticCoverage('1')).false;
    });
    it('should return false when no static coverage was reported for the mutant', () => {
      const sut = TestCoverage.from(
        factory.completeDryRunResult({ mutantCoverage: factory.mutantCoverage({ static: { 1: 0, 2: 1 } }) }),
        testInjector.logger,
      );
      expect(sut.hasStaticCoverage('1')).false;
    });
    it('should return true when static coverage was reported for the mutant', () => {
      const sut = TestCoverage.from(
        factory.completeDryRunResult({ mutantCoverage: factory.mutantCoverage({ static: { 1: 0, 2: 1 } }) }),
        testInjector.logger,
      );
      expect(sut.hasStaticCoverage('2')).true;
    });
  });

  describe(TestCoverage.prototype.addTest.name, () => {
    it('should add the test', () => {
      const sut = TestCoverage.from(factory.completeDryRunResult(), testInjector.logger);
      const test = factory.successTestResult({ id: 'spec1' });
      sut.addTest(test);
      expect(sut.testsById.get('spec1')).eq(test);
    });
  });

  describe(TestCoverage.prototype.addCoverage.name, () => {
    it("should create new coverage if the mutant didn't have any", () => {
      const spec1 = factory.testResult({ id: 'spec1' });
      const sut = new TestCoverage(new Map(), new Map([['spec1', spec1]]), {}, new Map());
      sut.addCoverage('1', ['spec1']);
      expect(sut.forMutant('1')).deep.eq(new Set([spec1]));
    });
    it('should expand on existing coverage if the mutant already was covered', () => {
      const spec1 = factory.testResult({ id: 'spec1' });
      const spec2 = factory.testResult({ id: 'spec2' });
      const sut = new TestCoverage(
        new Map([['mutant1', new Set([spec1])]]),
        new Map([
          ['spec1', spec1],
          ['spec2', spec2],
        ]),
        {},
        new Map(),
      );
      sut.addCoverage('mutant1', ['spec2']);
      expect(sut.forMutant('mutant1')).deep.eq(new Set([spec1, spec2]));
    });
    it('should ignore non-existing tests', () => {
      const spec1 = factory.testResult({ id: 'spec1' });
      const spec2 = factory.testResult({ id: 'spec2' });
      const sut = new TestCoverage(
        new Map([['mutant1', new Set([spec1])]]),
        new Map([
          ['spec1', spec1],
          ['spec2', spec2],
        ]),
        {},
        new Map(),
      );
      sut.addCoverage('mutant1', ['spec2', 'spec3']);
      expect(sut.forMutant('mutant1')).deep.eq(new Set([spec1, spec2]));
    });
  });

  describe(TestCoverage.from.name, () => {
    it('should correctly determine the coverage be test', () => {
      // Arrange
      const spec1 = factory.successTestResult({ id: 'spec1' });
      const spec2 = factory.successTestResult({ id: 'spec2' });
      const spec3 = factory.successTestResult({ id: 'spec3' });
      const dryRunResult = factory.completeDryRunResult({
        tests: [spec1, spec2, spec3],
        mutantCoverage: { static: { 1: 1 }, perTest: { ['spec1']: { 1: 2, 2: 100 }, ['spec2']: { 2: 100 }, ['spec3']: { 1: 3, 2: 0 } } },
      });

      // Act
      const actualCoverage = TestCoverage.from(dryRunResult, testInjector.logger);

      // Assert
      expect(actualCoverage.testsByMutantId).lengthOf(2);
      expect(actualCoverage.forMutant('1')).deep.eq(new Set([spec1, spec3]));
      expect(actualCoverage.forMutant('2')).deep.eq(new Set([spec1, spec2]));
    });

    it('should set `hasCoverage` to false when coverage is missing', () => {
      expect(TestCoverage.from(factory.completeDryRunResult(), testInjector.logger).hasCoverage).false;
    });

    it('should set `hasCoverage` to true when coverage of any kind is reported', () => {
      expect(TestCoverage.from(factory.completeDryRunResult({ mutantCoverage: { perTest: {}, static: {} } }), testInjector.logger).hasCoverage).that;
    });

    it('should calculate total hits correctly (add perTest and static)', () => {
      const dryRunResult = factory.completeDryRunResult({
        mutantCoverage: { static: { 1: 1 }, perTest: { ['spec1']: { 1: 2, 2: 100 }, ['spec2']: { 2: 100 }, ['spec3']: { 1: 3 } } },
      });
      const actualCoverage = TestCoverage.from(dryRunResult, testInjector.logger);

      expect(actualCoverage.hitsByMutantId).lengthOf(2);
      expect(actualCoverage.hitsByMutantId.get('1')).eq(6);
      expect(actualCoverage.hitsByMutantId.get('2')).eq(200);
    });

    it('should allow log when a non-existing test is presented (#2485)', () => {
      // Arrange
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 20 })], // test result for spec2 is missing
        mutantCoverage: { static: {}, perTest: { spec1: { 1: 1 }, spec2: { 1: 0, 2: 1 } } },
      });

      // Act
      TestCoverage.from(dryRunResult, testInjector.logger);

      // Assert
      expect(testInjector.logger.warn).calledWith(
        'Found test with id "spec2" in coverage data, but not in the test results of the dry run. Not taking coverage data for this test into account.',
      );
    });
  });
});
