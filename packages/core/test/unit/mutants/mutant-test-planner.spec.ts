import path from 'path';

import sinon from 'sinon';
import { expect } from 'chai';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { MutantEarlyResultPlan, MutantRunPlan, MutantTestPlan, PlanKind, Mutant, schema } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/report';

import { MutantTestPlanner } from '../../../src/mutants/index.js';
import { coreTokens } from '../../../src/di/index.js';
import { Sandbox } from '../../../src/sandbox/index.js';
import { Project } from '../../../src/fs/index.js';
import { FileSystemTestDouble } from '../../helpers/file-system-test-double.js';
import { loc } from '../../helpers/producers.js';
import { TestCoverageTestDouble } from '../../helpers/test-coverage-test-double.js';
import { IncrementalDiffer } from '../../../src/mutants/incremental-differ.js';

const TIME_OVERHEAD_MS = 501;

describe(MutantTestPlanner.name, () => {
  let reporterMock: sinon.SinonStubbedInstance<Required<Reporter>>;
  let sandboxMock: sinon.SinonStubbedInstance<Sandbox>;
  let fileSystemTestDouble: FileSystemTestDouble;
  let testCoverage: TestCoverageTestDouble;

  beforeEach(() => {
    reporterMock = factory.reporter();
    sandboxMock = sinon.createStubInstance(Sandbox);
    sandboxMock.sandboxFileFor.returns('sandbox/foo.js');
    fileSystemTestDouble = new FileSystemTestDouble();
    testCoverage = new TestCoverageTestDouble();
  });

  function act(
    mutants: Mutant[],
    project = new Project(fileSystemTestDouble, fileSystemTestDouble.toFileDescriptions()),
  ): Promise<readonly MutantTestPlan[]> {
    return testInjector.injector
      .provideValue(coreTokens.testCoverage, testCoverage)
      .provideValue(coreTokens.reporter, reporterMock)
      .provideValue(coreTokens.mutants, mutants)
      .provideValue(coreTokens.sandbox, sandboxMock)
      .provideValue(coreTokens.project, project)
      .provideValue(coreTokens.timeOverheadMS, TIME_OVERHEAD_MS)
      .provideClass(coreTokens.incrementalDiffer, IncrementalDiffer) // inject the real deal
      .injectClass(MutantTestPlanner)
      .makePlan(mutants);
  }

  it('should make an early result plan for an ignored mutant', async () => {
    const mutant = factory.mutant({ id: '2', status: 'Ignored', statusReason: 'foo should ignore' });

    // Act
    const result = await act([mutant]);

    // Assert
    const expected: MutantEarlyResultPlan[] = [
      { plan: PlanKind.EarlyResult, mutant: { ...mutant, static: false, status: 'Ignored', coveredBy: undefined, killedBy: undefined } },
    ];
    expect(result).deep.eq(expected);
  });

  it('should make a plan with an empty test filter for a mutant without coverage', async () => {
    // Arrange
    const mutant = factory.mutant({ id: '3' });
    testCoverage.addTest(factory.testResult({ id: 'spec2' }));
    testCoverage.addCoverage(1, ['spec2']);

    // Act
    const [result] = await act([mutant]);

    // Assert
    assertIsRunPlan(result);
    expect(result.mutant.coveredBy).lengthOf(0);
    expect(result.runOptions.testFilter).lengthOf(0);
    expect(result.mutant.static).false;
  });

  it('should provide the sandboxFileName', async () => {
    // Arrange
    const mutant = factory.mutant({ id: '3', fileName: 'file.js' });

    // Act
    const [result] = await act([mutant]);

    // Assert
    assertIsRunPlan(result);
    expect(result.runOptions.sandboxFileName).eq('sandbox/foo.js');
    expect(sandboxMock.sandboxFileFor).calledWith('file.js');
  });

  it('should pass disableBail in the runOptions', async () => {
    const mutant = factory.mutant({ id: '3', fileName: 'file.js' });
    testInjector.options.disableBail = true;

    // Act
    const [result] = await act([mutant]);

    // Assert
    assertIsRunPlan(result);
    expect(result.runOptions.disableBail).true;
  });

  it('should report onMutationTestingPlanReady', async () => {
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
    testCoverage.addTest(factory.successTestResult({ timeSpentMs: 20 }));
    testCoverage.addTest(factory.successTestResult({ timeSpentMs: 22 }));

    // Act
    const mutantPlans = await act(mutants);

    // Assert
    sinon.assert.calledOnceWithExactly(reporterMock.onMutationTestingPlanReady, { mutantPlans });
  });

  describe('coverage', () => {
    describe('without mutant coverage data', () => {
      it('should disable the test filter', async () => {
        // Arrange
        const mutant1 = factory.mutant({ id: '1' });
        const mutant2 = factory.mutant({ id: '2' });
        const mutants = [mutant1, mutant2];

        // Act
        const [plan1, plan2] = await act(mutants);

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

      it('should disable the hitLimit', async () => {
        // Arrange
        const mutants = [factory.mutant({ id: '1' })];

        // Act
        const [result] = await act(mutants);

        // Assert
        assertIsRunPlan(result);
        expect(result.runOptions.hitLimit).undefined;
      });

      it('should calculate timeout and net time using the sum of all tests', async () => {
        // Arrange
        const mutant1 = factory.mutant({ id: '1' });
        const mutants = [mutant1];
        testCoverage.addTest(factory.successTestResult({ id: 'spec1', timeSpentMs: 20 }));
        testCoverage.addTest(factory.successTestResult({ id: 'spec2', timeSpentMs: 22 }));

        // Act
        const [result] = await act(mutants);

        // Assert
        assertIsRunPlan(result);
        expect(result.runOptions.timeout).eq(calculateTimeout(42));
        expect(result.netTime).eq(42);
      });
    });

    describe('with static coverage', () => {
      it('should ignore when ignoreStatic is enabled', async () => {
        // Arrange
        testInjector.options.ignoreStatic = true;
        const mutant = factory.mutant({ id: '1' });
        const mutants = [mutant];
        testCoverage.staticCoverage['1'] = true;
        testCoverage.addTest(factory.successTestResult({ id: 'spec1', timeSpentMs: 0 }));
        testCoverage.hasCoverage = true;

        // Act
        const result = await act(mutants);

        // Assert
        const expected: MutantTestPlan[] = [
          {
            plan: PlanKind.EarlyResult,
            mutant: {
              ...mutant,
              status: 'Ignored',
              statusReason: 'Static mutant (and "ignoreStatic" was enabled)',
              static: true,
              coveredBy: [],
              killedBy: undefined,
            },
          },
        ];
        expect(result).deep.eq(expected);
      });

      it('should disable test filtering, set reload environment and activate mutant statically when ignoreStatic is disabled', async () => {
        // Arrange
        testInjector.options.ignoreStatic = false;
        const mutants = [factory.mutant({ id: '1' })];
        testCoverage.staticCoverage['1'] = true;
        testCoverage.addTest(factory.successTestResult({ id: 'spec1', timeSpentMs: 0 }));
        testCoverage.hasCoverage = true;

        // Act
        const [result] = await act(mutants);

        // Assert
        assertIsRunPlan(result);
        expect(result.mutant.coveredBy).lengthOf(0);
        expect(result.mutant.static).true;
        expect(result.runOptions.reloadEnvironment).true;
        expect(result.runOptions.testFilter).undefined;
        expect(result.runOptions.mutantActivation).eq('static');
      });

      it('should set activeMutant on the runOptions', async () => {
        // Arrange
        const mutants = [Object.freeze(factory.mutant({ id: '1' }))];
        testCoverage.addTest(factory.successTestResult({ id: 'spec1', timeSpentMs: 0 }));

        // Act
        const [result] = await act(mutants);

        // Assert
        assertIsRunPlan(result);
        expect(result.runOptions.activeMutant).deep.eq(mutants[0]);
      });

      it('should calculate the hitLimit based on total hits (perTest and static)', async () => {
        // Arrange
        const mutant = factory.mutant({ id: '1' });
        const mutants = [mutant];
        testCoverage.hitsByMutantId.set('1', 6);

        // Act
        const [result] = await act(mutants);

        // Assert
        assertIsRunPlan(result);
        expect(result.runOptions.hitLimit).deep.eq(600);
      });

      it('should calculate timeout and net time using the sum of all tests', async () => {
        // Arrange
        const mutant = factory.mutant({ id: '1' });
        const mutants = [mutant];
        testCoverage.addTest(factory.successTestResult({ id: 'spec1', timeSpentMs: 20 }));
        testCoverage.addTest(factory.successTestResult({ id: 'spec2', timeSpentMs: 22 }));

        // Act
        const [result] = await act(mutants);

        // Assert
        assertIsRunPlan(result);
        expect(result.runOptions.timeout).eq(calculateTimeout(42));
        expect(result.netTime).eq(42);
      });
    });

    describe('with hybrid coverage', () => {
      it('should set the testFilter, coveredBy, static and runtime mutant activation when ignoreStatic is enabled', async () => {
        // Arrange
        testInjector.options.ignoreStatic = true;
        const mutants = [factory.mutant({ id: '1' })];
        testCoverage.addTest(factory.successTestResult({ id: 'spec1', timeSpentMs: 10 }));
        testCoverage.addCoverage('1', ['spec1']);
        testCoverage.staticCoverage['1'] = true;

        // Act
        const [result] = await act(mutants);

        // Assert
        assertIsRunPlan(result);
        const { mutant, runOptions } = result;
        expect(mutant.coveredBy).deep.eq(['spec1']);
        expect(mutant.static).deep.eq(true);
        expect(runOptions.testFilter).deep.eq(['spec1']);
        expect(result.runOptions.mutantActivation).eq('runtime');
      });

      it('should disable test filtering and statically activate the mutant, yet still set coveredBy and static when ignoreStatic is false', async () => {
        // Arrange
        testInjector.options.ignoreStatic = false;
        const mutants = [factory.mutant({ id: '1' })];
        testCoverage.addTest(factory.successTestResult({ id: 'spec1', timeSpentMs: 10 }));
        testCoverage.addTest(factory.successTestResult({ id: 'spec2', timeSpentMs: 20 }));
        testCoverage.staticCoverage['1'] = true;
        testCoverage.addCoverage('1', ['spec1']);

        // Act
        const [result] = await act(mutants);

        // Assert
        assertIsRunPlan(result);
        const { mutant, runOptions } = result;
        expect(mutant.coveredBy).deep.eq(['spec1']);
        expect(mutant.static).deep.eq(true);
        expect(runOptions.testFilter).deep.eq(undefined);
        expect(result.runOptions.mutantActivation).eq('static');
      });
    });

    describe('with perTest coverage', () => {
      it('should enable test filtering with runtime mutant activation for covered tests', async () => {
        // Arrange
        const mutants = [factory.mutant({ id: '1' }), factory.mutant({ id: '2' })];
        testCoverage.addTest(factory.successTestResult({ id: 'spec1', timeSpentMs: 0 }), factory.successTestResult({ id: 'spec2', timeSpentMs: 0 }));
        testCoverage.addCoverage('1', ['spec1']);
        testCoverage.addCoverage('2', ['spec2']);
        testCoverage.staticCoverage['1'] = false;

        // Act
        const [plan1, plan2] = await act(mutants);

        // Assert
        assertIsRunPlan(plan1);
        assertIsRunPlan(plan2);
        const { runOptions: runOptions1, mutant: mutant1 } = plan1;
        const { runOptions: runOptions2, mutant: mutant2 } = plan2;
        expect(runOptions1.testFilter).deep.eq(['spec1']);
        expect(runOptions1.mutantActivation).eq('runtime');
        expect(mutant1.coveredBy).deep.eq(['spec1']);
        expect(mutant1.static).false;
        expect(runOptions2.testFilter).deep.eq(['spec2']);
        expect(runOptions2.mutantActivation).eq('runtime');
        expect(mutant2.coveredBy).deep.eq(['spec2']);
        expect(mutant2.static).false;
      });

      it('should calculate timeout and net time using the sum of covered tests', async () => {
        // Arrange
        const mutants = [factory.mutant({ id: '1' }), factory.mutant({ id: '2' })];
        testCoverage.addTest(
          factory.successTestResult({ id: 'spec1', timeSpentMs: 20 }),
          factory.successTestResult({ id: 'spec2', timeSpentMs: 10 }),
          factory.successTestResult({ id: 'spec3', timeSpentMs: 22 }),
        );
        testCoverage.staticCoverage['1'] = false;
        testCoverage.addCoverage('1', ['spec1', 'spec3']);
        testCoverage.addCoverage('2', ['spec2']);

        // Act
        const [plan1, plan2] = await act(mutants);

        // Assert
        assertIsRunPlan(plan1);
        assertIsRunPlan(plan2);
        expect(plan1.netTime).eq(42); // spec1 + spec3
        expect(plan2.netTime).eq(10); // spec2
        expect(plan1.runOptions.timeout).eq(calculateTimeout(42)); // spec1 + spec3
        expect(plan2.runOptions.timeout).eq(calculateTimeout(10)); // spec2
      });
    });
  });

  describe('static mutants warning', () => {
    function arrangeStaticWarning() {
      const mutants = [
        factory.mutant({ id: '1' }),
        factory.mutant({ id: '2' }),
        factory.mutant({ id: '3' }),
        factory.mutant({ id: '4' }), // static
        factory.mutant({ id: '8' }),
        factory.mutant({ id: '9' }),
        factory.mutant({ id: '10' }),
      ];
      testCoverage.addTest(
        factory.successTestResult({ id: 'spec1', timeSpentMs: 10 }),
        factory.successTestResult({ id: 'spec2', timeSpentMs: 10 }),
        factory.successTestResult({ id: 'spec3', timeSpentMs: 10 }),
        factory.successTestResult({ id: 'spec4', timeSpentMs: 10 }),
      );
      arrangeStaticCoverage(4, 5, 6, 7);
      testCoverage.addCoverage(1, ['spec1']);
      testCoverage.addCoverage(2, ['spec2']);
      testCoverage.addCoverage(3, ['spec3']);
      testCoverage.addCoverage(8, ['spec3']);
      testCoverage.addCoverage(9, ['spec3']);
      testCoverage.addCoverage(10, ['spec2']);
      return { mutants };
    }

    it('should warn when the estimated time to run all static mutants exceeds 40% and the performance impact of a static mutant is estimated to be twice that of other mutants', async () => {
      // Arrange
      testInjector.options.ignoreStatic = false;
      const { mutants } = arrangeStaticWarning();

      // Act
      await act(mutants);

      // Assert
      expect(testInjector.logger.warn)
        .calledWithMatch('Detected 1 static mutants (14% of total) that are estimated to take 40% of the time running the tests!')
        .and.calledWithMatch('(disable "warnings.slow" to ignore this warning)');
    });

    it('should warn when 100% of the mutants are static', async () => {
      // Arrange
      testInjector.options.ignoreStatic = false;
      const mutants = [factory.mutant({ id: '1' }), factory.mutant({ id: '2' })];
      testCoverage.addTest(factory.successTestResult({ id: 'spec1', timeSpentMs: 10 }));
      testCoverage.hasCoverage = true;
      arrangeStaticCoverage(1, 2);

      // Act
      await act(mutants);

      // Assert
      expect(testInjector.logger.warn).calledWithMatch(
        'Detected 2 static mutants (100% of total) that are estimated to take 100% of the time running the tests!',
      );
    });

    it('should not warn when ignore static is enabled', async () => {
      // Arrange
      testInjector.options.ignoreStatic = true;
      const { mutants } = arrangeStaticWarning();

      // Act
      await act(mutants);

      // Assert
      expect(testInjector.logger.warn).not.called;
    });

    it('should not warn when "warning.slow" is disabled', async () => {
      // Arrange
      testInjector.options.ignoreStatic = false;
      testInjector.options.warnings = factory.warningOptions({ slow: false });
      const { mutants } = arrangeStaticWarning();

      // Act
      await act(mutants);

      // Assert
      expect(testInjector.logger.warn).not.called;
    });

    it('should not warn when all static mutants is not estimated to exceed 40%', async () => {
      // Arrange
      const mutants = [
        factory.mutant({ id: '1' }),
        factory.mutant({ id: '2' }),
        factory.mutant({ id: '3' }),
        factory.mutant({ id: '4' }), // static
        factory.mutant({ id: '8' }),
        factory.mutant({ id: '9' }),
        factory.mutant({ id: '10' }),
      ];
      testCoverage.addTest(
        factory.successTestResult({ id: 'spec1', timeSpentMs: 10 }),
        factory.successTestResult({ id: 'spec2', timeSpentMs: 10 }),
        factory.successTestResult({ id: 'spec3', timeSpentMs: 10 }),
        factory.successTestResult({ id: 'spec4', timeSpentMs: 9 }),
      );
      arrangeStaticCoverage(4, 5, 6, 7);
      testCoverage.addCoverage(1, ['spec1']);
      testCoverage.addCoverage(2, ['spec2']);
      testCoverage.addCoverage(10, ['spec2']);
      testCoverage.addCoverage(3, ['spec3']);
      testCoverage.addCoverage(8, ['spec3']);
      testCoverage.addCoverage(9, ['spec3']);

      // Act
      await act(mutants);

      // Assert
      expect(testInjector.logger.warn).not.called;
    });

    it('should not warn when the performance impact of a static mutant is not estimated to be twice that of other mutants', async () => {
      // Arrange
      const mutants = [
        factory.mutant({ id: '1' }),
        factory.mutant({ id: '2' }),
        factory.mutant({ id: '3' }),
        factory.mutant({ id: '4' }), // static
        factory.mutant({ id: '5' }), // static
        factory.mutant({ id: '6' }), // static
      ];
      testCoverage.addTest(
        factory.successTestResult({ id: 'spec1', timeSpentMs: 1 }),
        factory.successTestResult({ id: 'spec2', timeSpentMs: 3 }),
        factory.successTestResult({ id: 'spec3', timeSpentMs: 0.1 }),
        factory.successTestResult({ id: 'spec4', timeSpentMs: 7 }),
      );
      arrangeStaticCoverage(4, 5, 6);
      testCoverage.addCoverage(1, ['spec2', 'spec1']);
      testCoverage.addCoverage(2, ['spec2', 'spec4']);
      testCoverage.addCoverage(3, ['spec2']);

      testCoverage.addCoverage(3, ['spec3']);
      testCoverage.addCoverage(8, ['spec3']);
      testCoverage.addCoverage(9, ['spec3']);
      // static = 11.1
      // runtime = 5.6*2=11.3;

      // Act
      await act(mutants);

      // Assert
      expect(testInjector.logger.warn).not.called;
    });
  });

  describe('incremental', () => {
    class ScenarioBuilder {
      readonly #mutants: Mutant[] = [];
      #srcFileName = 'foo.js';
      #testFileName = 'foo.spec.js';
      #incrementalReport: schema.MutationTestResult | undefined = undefined;

      public withWindowsPathSeparator() {
        // Deliberately not replacing all slashes, otherwise `path.relative` won't work on linux.
        this.#srcFileName = 'src\\foo.js';
        this.#testFileName = 'src\\foo.spec.js';
        return this;
      }

      public withIncrementalKilledMutant() {
        const testFileFullName = path.resolve(this.#testFileName);
        const srcFileFullName = path.resolve(this.#srcFileName);
        this.#mutants.push(
          factory.mutant({ id: '1', fileName: srcFileFullName, mutatorName: 'fooMutator', replacement: '<=', location: loc(0, 0, 0, 1) }),
        );
        fileSystemTestDouble.files[srcFileFullName] = 'foo';
        fileSystemTestDouble.files[testFileFullName] = 'describe("foo")';
        this.#incrementalReport = factory.mutationTestReportSchemaMutationTestResult({
          files: {
            [this.#srcFileName.replace(/\\/g, '/')]: factory.mutationTestReportSchemaFileResult({
              source: 'foo',
              mutants: [
                factory.mutantResult({
                  status: 'Killed',
                  replacement: '<=',
                  mutatorName: 'fooMutator',
                  location: loc(0, 0, 0, 1),
                  killedBy: ['1'],
                  coveredBy: ['1'],
                }),
              ],
            }),
          },
          testFiles: {
            [this.#testFileName.replace(/\\/g, '/')]: factory.mutationTestReportSchemaTestFile({
              source: 'describe("foo")',
              tests: [factory.mutationTestReportSchemaTestDefinition({ id: '1', name: 'foo should bar' })],
            }),
          },
        });
        testCoverage.addTest(factory.testResult({ fileName: testFileFullName, id: 'spec1', name: 'foo should bar' }));
        testCoverage.addCoverage(1, ['spec1']);
        return this;
      }

      public build() {
        const project = new Project(fileSystemTestDouble, fileSystemTestDouble.toFileDescriptions(), this.#incrementalReport);
        return { mutants: this.#mutants, project };
      }
    }

    // Actual diffing algorithm is tested in the 'incremental-differ' unit tests
    // These are just the unit tests for testing the integration between the planner and the differ

    it("should plan an early result for mutants that didn't change", async () => {
      // Arrange
      const { mutants, project } = new ScenarioBuilder().withIncrementalKilledMutant().build();

      // Act
      const [actualPlan] = await act(mutants, project);

      // Assert
      assertIsEarlyResultPlan(actualPlan);
      expect(actualPlan.mutant.status).eq('Killed');
      expect(actualPlan.mutant.killedBy).deep.eq(['spec1']);
    });

    it('should normalize file names before passing them to the differ', async () => {
      // Arrange
      const { mutants, project } = new ScenarioBuilder().withWindowsPathSeparator().withIncrementalKilledMutant().build();

      // Act
      const [actualPlan] = await act(mutants, project);

      // Assert
      assertIsEarlyResultPlan(actualPlan);
      expect(actualPlan.mutant.status).eq('Killed');
      expect(actualPlan.mutant.killedBy).deep.eq(['spec1']);
    });
  });

  function arrangeStaticCoverage(...mutantIds: Array<number | string>) {
    for (const mutantId of mutantIds) {
      testCoverage.staticCoverage[mutantId] = true;
    }
  }
});

function assertIsRunPlan(plan: MutantTestPlan): asserts plan is MutantRunPlan {
  expect(plan.plan).eq(PlanKind.Run);
}
function assertIsEarlyResultPlan(plan: MutantTestPlan): asserts plan is MutantEarlyResultPlan {
  expect(plan.plan).eq(PlanKind.EarlyResult);
}
function calculateTimeout(netTime: number): number {
  return testInjector.options.timeoutMS + testInjector.options.timeoutFactor * netTime + TIME_OVERHEAD_MS;
}
