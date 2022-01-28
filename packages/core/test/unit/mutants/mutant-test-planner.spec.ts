import sinon from 'sinon';
import { expect } from 'chai';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { CompleteDryRunResult } from '@stryker-mutator/api/test-runner';
import { Mutant, MutantStatus, MutantTestCoverage } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/report';

import { MutantTestPlanner } from '../../../src/mutants/mutant-test-planner';
import { coreTokens } from '../../../src/di';
import { Sandbox } from '../../../src/sandbox';
import { MutantEarlyResultPlan, MutantRunPlan, MutantTestPlan, PlanKind } from '../../../src/mutants';

const TIME_OVERHEAD_MS = 501;

describe(MutantTestPlanner.name, () => {
  let reporterMock: sinon.SinonStubbedInstance<Required<Reporter>>;
  let sandboxMock: sinon.SinonStubbedInstance<Sandbox>;

  beforeEach(() => {
    reporterMock = factory.reporter();
    sandboxMock = sinon.createStubInstance(Sandbox);
    sandboxMock.sandboxFileFor.returns('sandbox/foo.js');
  });

  function act(dryRunResult: CompleteDryRunResult, mutants: Mutant[]) {
    return testInjector.injector
      .provideValue(coreTokens.reporter, reporterMock)
      .provideValue(coreTokens.dryRunResult, dryRunResult)
      .provideValue(coreTokens.mutants, mutants)
      .provideValue(coreTokens.sandbox, sandboxMock)
      .provideValue(coreTokens.timeOverheadMS, TIME_OVERHEAD_MS)
      .injectClass(MutantTestPlanner)
      .makePlan(mutants);
  }

  it('should make an early result plan for an ignored mutant', () => {
    const mutant = factory.mutant({ id: '2', status: MutantStatus.Ignored, statusReason: 'foo should ignore' });
    const dryRunResult = factory.completeDryRunResult({ mutantCoverage: { static: {}, perTest: { '1': { 2: 2 } } } });

    // Act
    const result = act(dryRunResult, [mutant]);

    // Assert
    const expected: MutantEarlyResultPlan[] = [
      { plan: PlanKind.EarlyResult, mutant: { ...mutant, static: false, status: MutantStatus.Ignored, coveredBy: undefined } },
    ];
    expect(result).deep.eq(expected);
  });

  it('should make a plan with an empty test filter for a mutant without coverage', () => {
    // Arrange
    const mutant = factory.mutant({ id: '3' });
    const dryRunResult = factory.completeDryRunResult({ mutantCoverage: { static: {}, perTest: { '1': { 2: 2 } } } });

    // Act
    const [result] = act(dryRunResult, [mutant]);

    // Assert
    assertIsRunPlan(result);
    expect(result.mutant.coveredBy).lengthOf(0);
    expect(result.runOptions.testFilter).lengthOf(0);
    expect(result.mutant.static).false;
  });

  it('should provide the sandboxFileName', async () => {
    // Arrange
    const mutant = factory.mutant({ id: '3', fileName: 'file.js' });
    const dryRunResult = factory.completeDryRunResult({ mutantCoverage: { static: {}, perTest: { '1': { 2: 2 } } } });

    // Act
    const [result] = act(dryRunResult, [mutant]);

    // Assert
    assertIsRunPlan(result);
    expect(result.runOptions.sandboxFileName).eq('sandbox/foo.js');
    expect(sandboxMock.sandboxFileFor).calledWith('file.js');
  });

  it('should pass disableBail in the runOptions', async () => {
    const mutant = factory.mutant({ id: '3', fileName: 'file.js' });
    const dryRunResult = factory.completeDryRunResult({ mutantCoverage: { static: {}, perTest: { '1': { 2: 2 } } } });
    testInjector.options.disableBail = true;

    // Act
    const [result] = act(dryRunResult, [mutant]);

    // Assert
    assertIsRunPlan(result);
    expect(result.runOptions.disableBail).true;
  });

  describe('without mutant coverage data', () => {
    it('should disable the test filter', () => {
      // Arrange
      const mutant1 = factory.mutant({ id: '1' });
      const mutant2 = factory.mutant({ id: '2' });
      const mutants = [mutant1, mutant2];
      const dryRunResult = factory.completeDryRunResult({ mutantCoverage: undefined });

      // Act
      const [plan1, plan2] = act(dryRunResult, mutants);

      // Assert
      assertIsRunPlan(plan1);
      assertIsRunPlan(plan2);
      expect(plan1.runOptions.testFilter).undefined;
      expect(plan1.mutant.coveredBy).undefined;
      expect(plan1.mutant.static).undefined;
      expect(plan2.runOptions.testFilter).undefined;
      expect(plan2.mutant.coveredBy).undefined;
      expect(plan2.mutant.static).undefined;
    });

    it('should disable the hitLimit', () => {
      // Arrange
      const mutants = [factory.mutant({ id: '1' })];
      const dryRunResult = factory.completeDryRunResult({ mutantCoverage: undefined });

      // Act
      const [result] = act(dryRunResult, mutants);

      // Assert
      assertIsRunPlan(result);
      expect(result.runOptions.hitLimit).undefined;
    });

    it('should calculate timeout using the sum of all tests', () => {
      // Arrange
      const mutant1 = factory.mutant({ id: '1' });
      const mutants = [mutant1];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ timeSpentMs: 20 }), factory.successTestResult({ timeSpentMs: 22 })],
        mutantCoverage: undefined,
      });

      // Act
      const [result] = act(dryRunResult, mutants);

      // Assert
      assertIsRunPlan(result);
      expect(result.runOptions.timeout).eq(calculateTimeout(42));
    });

    it('should report onAllMutantsMatchedWithTests', () => {
      // Arrange
      const mutants = [
        factory.mutant({
          id: '1',
          fileName: 'foo.js',
          mutatorName: 'fooMutator',
          replacement: '<=',
          location: { start: { line: 0, column: 0 }, end: { line: 0, column: 1 } },
        }),
        factory.mutant({
          id: '2',
          fileName: 'bar.js',
          mutatorName: 'barMutator',
          replacement: '{}',
          location: { start: { line: 0, column: 2 }, end: { line: 0, column: 3 } },
        }),
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
          static: undefined,
          location: { start: { line: 0, column: 0 }, end: { line: 0, column: 1 } },
        }),
        factory.mutantTestCoverage({
          id: '2',
          fileName: 'bar.js',
          mutatorName: 'barMutator',
          replacement: '{}',
          static: undefined,
          location: { start: { line: 0, column: 2 }, end: { line: 0, column: 3 } },
        }),
      ]);
    });
  });

  describe('with static coverage', () => {
    it('should ignore when ignoreStatic is enabled', async () => {
      // Arrange
      testInjector.options.ignoreStatic = true;
      const mutant = factory.mutant({ id: '1' });
      const mutants = [mutant];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 0 })],
        mutantCoverage: { static: { 1: 1 }, perTest: {} },
      });

      // Act
      const result = act(dryRunResult, mutants);

      // Assert
      const expected: MutantTestPlan[] = [
        {
          plan: PlanKind.EarlyResult,
          mutant: {
            ...mutant,
            status: MutantStatus.Ignored,
            statusReason: 'Static mutant (and "ignoreStatic" was enabled)',
            static: true,
            coveredBy: [],
          },
        },
      ];
      expect(result).deep.eq(expected);
    });

    it('should disable test filtering and set reload environment when ignoreStatic is disabled', () => {
      // Arrange
      testInjector.options.ignoreStatic = false;
      const mutants = [factory.mutant({ id: '1' })];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 0 })],
        mutantCoverage: { static: { 1: 1 }, perTest: {} },
      });

      // Act
      const [result] = act(dryRunResult, mutants);

      // Assert
      assertIsRunPlan(result);
      expect(result.mutant.coveredBy).lengthOf(0);
      expect(result.mutant.static).true;
      expect(result.runOptions.reloadEnvironment).true;
      expect(result.runOptions.testFilter).undefined;
    });

    it('should calculate the hitLimit based on total hits (perTest and static)', () => {
      // Arrange
      const mutant = factory.mutant({ id: '1' });
      const mutants = [mutant];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 0 })],
        mutantCoverage: { static: { 1: 1 }, perTest: { 1: { 1: 2, 2: 100 }, 2: { 2: 100 }, 3: { 1: 3 } } },
      });

      // Act
      const [result] = act(dryRunResult, mutants);

      // Assert
      assertIsRunPlan(result);
      expect(result.runOptions.hitLimit).deep.eq(600);
    });

    it('should calculate timeout with the sum of all tests', () => {
      // Arrange
      const mutant = factory.mutant({ id: '1' });
      const mutants = [mutant];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 20 }), factory.successTestResult({ id: 'spec1', timeSpentMs: 22 })],
        mutantCoverage: { static: { 1: 1 }, perTest: {} },
      });

      // Act
      const [result] = act(dryRunResult, mutants);

      // Assert
      assertIsRunPlan(result);
      expect(result.runOptions.timeout).eq(calculateTimeout(42));
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
        coveredBy: [],
      };
      const expectedSecondMatch: Partial<MutantTestCoverage> = {
        id: '2',
        static: false,
        coveredBy: [],
      };
      expect(reporterMock.onAllMutantsMatchedWithTests).calledWithMatch([sinon.match(expectedFirstMatch), sinon.match(expectedSecondMatch)]);
    });
  });

  describe('with hybrid coverage', () => {
    it('should set the testFilter, coveredBy and static when ignoreStatic is enabled', async () => {
      // Arrange
      testInjector.options.ignoreStatic = true;
      const mutants = [factory.mutant({ id: '1' })];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 10 })],
        mutantCoverage: { static: { 1: 1 }, perTest: { spec1: { 1: 1 } } },
      });

      // Act
      const [result] = act(dryRunResult, mutants);

      // Assert
      assertIsRunPlan(result);
      const { mutant, runOptions } = result;
      expect(mutant.coveredBy).deep.eq(['spec1']);
      expect(mutant.static).deep.eq(true);
      expect(runOptions.testFilter).deep.eq(['spec1']);
    });

    it('should disable test filtering yet still set coveredBy and static when ignoreStatic is false', async () => {
      // Arrange
      testInjector.options.ignoreStatic = false;
      const mutants = [factory.mutant({ id: '1' })];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 10 }), factory.successTestResult({ id: 'spec2', timeSpentMs: 20 })],
        mutantCoverage: { static: { 1: 1 }, perTest: { spec1: { 1: 1 } } },
      });

      // Act
      const [result] = act(dryRunResult, mutants);

      // Assert
      assertIsRunPlan(result);
      const { mutant, runOptions } = result;
      expect(mutant.coveredBy).deep.eq(['spec1']);
      expect(mutant.static).deep.eq(true);
      expect(runOptions.testFilter).deep.eq(undefined);
    });
  });

  describe('with perTest coverage', () => {
    it('should enable test filtering for covered tests', () => {
      // Arrange
      const mutants = [factory.mutant({ id: '1' }), factory.mutant({ id: '2' })];
      const dryRunResult = factory.completeDryRunResult({
        tests: [factory.successTestResult({ id: 'spec1', timeSpentMs: 0 }), factory.successTestResult({ id: 'spec2', timeSpentMs: 0 })],
        mutantCoverage: { static: { 1: 0 }, perTest: { spec1: { 1: 1 }, spec2: { 1: 0, 2: 1 } } },
      });

      // Act
      const [plan1, plan2] = act(dryRunResult, mutants);

      // Assert
      assertIsRunPlan(plan1);
      assertIsRunPlan(plan2);
      const { runOptions: runOptions1, mutant: mutant1 } = plan1;
      const { runOptions: runOptions2, mutant: mutant2 } = plan2;
      expect(runOptions1.testFilter).deep.eq(['spec1']);
      expect(mutant1.coveredBy).deep.eq(['spec1']);
      expect(mutant1.static).false;
      expect(runOptions2.testFilter).deep.eq(['spec2']);
      expect(mutant2.coveredBy).deep.eq(['spec2']);
      expect(mutant2.static).false;
    });

    it('should calculate timeout using the sum of covered tests', () => {
      // Arrange
      const mutants = [factory.mutant({ id: '1' }), factory.mutant({ id: '2' })];
      const dryRunResult = factory.completeDryRunResult({
        tests: [
          factory.successTestResult({ id: 'spec1', timeSpentMs: 20 }),
          factory.successTestResult({ id: 'spec2', timeSpentMs: 10 }),
          factory.successTestResult({ id: 'spec3', timeSpentMs: 22 }),
        ],
        mutantCoverage: { static: { 1: 0 }, perTest: { spec1: { 1: 1 }, spec2: { 1: 0, 2: 1 }, spec3: { 1: 2 } } },
      });

      // Act
      const [plan1, plan2] = act(dryRunResult, mutants);

      // Assert
      assertIsRunPlan(plan1);
      assertIsRunPlan(plan2);
      expect(plan1.runOptions.timeout).eq(calculateTimeout(42)); // spec1 + spec3
      expect(plan2.runOptions.timeout).eq(calculateTimeout(10)); // spec2
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
      expect(actualMatches.find(({ mutant }) => mutant.id === '1')?.mutant.coveredBy).deep.eq(['spec1']);
      expect(actualMatches.find(({ mutant }) => mutant.id === '2')?.mutant.coveredBy).lengthOf(0);
      expect(testInjector.logger.warn).calledWith(
        'Found test with id "spec2" in coverage data, but not in the test results of the dry run. Not taking coverage data for this test into account.'
      );
    });
  });
});

function assertIsRunPlan(plan: MutantTestPlan): asserts plan is MutantRunPlan {
  expect(plan.plan).eq(PlanKind.Run);
}
function calculateTimeout(netTime: number): number {
  return testInjector.options.timeoutMS + testInjector.options.timeoutFactor * netTime + TIME_OVERHEAD_MS;
}
