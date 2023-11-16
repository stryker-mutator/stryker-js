import sinon from 'sinon';
import { expect } from 'chai';
import { testInjector, factory, tick } from '@stryker-mutator/test-helpers';
import { Reporter } from '@stryker-mutator/api/report';
import { TestRunner, MutantRunOptions, MutantRunResult, MutantRunStatus, CompleteDryRunResult, TestResult } from '@stryker-mutator/api/test-runner';
import { CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Mutant, MutantTestCoverage, MutantEarlyResultPlan, MutantRunPlan, MutantTestPlan } from '@stryker-mutator/api/core';
import { I, Task } from '@stryker-mutator/util';

import { MutationTestExecutor } from '../../../src/process/index.js';
import { coreTokens } from '../../../src/di/index.js';
import { createTestRunnerPoolMock, createCheckerPoolMock } from '../../helpers/producers.js';
import { MutationTestReportHelper } from '../../../src/reporters/mutation-test-report-helper.js';
import { Timer } from '../../../src/utils/timer.js';
import { ConcurrencyTokenProvider, Pool } from '../../../src/concurrent/index.js';
import { Sandbox } from '../../../src/sandbox/index.js';
import { MutantTestPlanner } from '../../../src/mutants/index.js';
import { CheckerFacade } from '../../../src/checker/checker-facade.js';

function ignoredEarlyResultPlan(overrides?: Partial<Mutant>): MutantEarlyResultPlan {
  return factory.mutantEarlyResultPlan({
    mutant: { ...factory.mutant(overrides), status: 'Ignored' },
  });
}

function mutantRunPlan(overrides?: Partial<MutantRunOptions & MutantTestCoverage>): MutantRunPlan {
  const mutant = factory.mutantTestCoverage(overrides);
  return factory.mutantRunPlan({
    runOptions: factory.mutantRunOptions({ ...overrides, activeMutant: mutant }),
    mutant,
  });
}

describe(MutationTestExecutor.name, () => {
  let reporterMock: Required<Reporter>;
  let testRunnerPoolMock: sinon.SinonStubbedInstance<I<Pool<TestRunner>>>;
  let checkerPoolMock: sinon.SinonStubbedInstance<I<Pool<I<CheckerFacade>>>>;
  let sut: MutationTestExecutor;
  let mutants: MutantTestCoverage[];
  let mutantTestPlans: MutantTestPlan[];
  let checker: sinon.SinonStubbedInstance<I<CheckerFacade>>;
  let mutationTestReportHelperMock: sinon.SinonStubbedInstance<MutationTestReportHelper>;
  let mutantTestPlannerMock: sinon.SinonStubbedInstance<MutantTestPlanner>;
  let timerMock: sinon.SinonStubbedInstance<Timer>;
  let testRunner: sinon.SinonStubbedInstance<Required<TestRunner>>;
  let concurrencyTokenProviderMock: sinon.SinonStubbedInstance<ConcurrencyTokenProvider>;
  let sandboxMock: sinon.SinonStubbedInstance<Sandbox>;
  let completeDryRunResult: sinon.SinonStubbedInstance<CompleteDryRunResult>;

  beforeEach(() => {
    reporterMock = factory.reporter();
    mutationTestReportHelperMock = sinon.createStubInstance(MutationTestReportHelper);
    mutantTestPlannerMock = sinon.createStubInstance(MutantTestPlanner);
    timerMock = sinon.createStubInstance(Timer);
    testRunner = factory.testRunner();
    testRunnerPoolMock = createTestRunnerPoolMock();
    checkerPoolMock = createCheckerPoolMock();
    checker = { init: sinon.stub(), group: sinon.stub(), check: sinon.stub(), dispose: sinon.stub() };
    concurrencyTokenProviderMock = sinon.createStubInstance(ConcurrencyTokenProvider);
    sandboxMock = sinon.createStubInstance(Sandbox);
    (
      checkerPoolMock.schedule as sinon.SinonStub<
        [Observable<Mutant>, (checker: I<CheckerFacade>, arg: Mutant) => Promise<CheckResult>],
        Observable<CheckResult>
      >
    ).callsFake((item$, task) => item$.pipe(mergeMap((item) => task(checker, item))));
    (
      testRunnerPoolMock.schedule as sinon.SinonStub<
        [Observable<MutantTestCoverage>, (testRunner: TestRunner, arg: MutantTestCoverage) => Promise<MutantRunResult>],
        Observable<MutantRunResult>
      >
    ).callsFake((item$, task) => item$.pipe(mergeMap((item) => task(testRunner, item))));

    mutants = [factory.mutant()];
    mutantTestPlans = [];
    completeDryRunResult = factory.completeDryRunResult();
    mutantTestPlannerMock.makePlan.resolves(mutantTestPlans);
    sut = testInjector.injector
      .provideValue(coreTokens.reporter, reporterMock)
      .provideValue(coreTokens.checkerPool, checkerPoolMock)
      .provideValue(coreTokens.testRunnerPool, testRunnerPoolMock)
      .provideValue(coreTokens.timeOverheadMS, 42)
      .provideValue(coreTokens.mutants, mutants)
      .provideValue(coreTokens.mutantTestPlanner, mutantTestPlannerMock)
      .provideValue(coreTokens.mutationTestReportHelper, mutationTestReportHelperMock)
      .provideValue(coreTokens.sandbox, sandboxMock)
      .provideValue(coreTokens.timer, timerMock)
      .provideValue(coreTokens.testRunnerPool, testRunnerPoolMock)
      .provideValue(coreTokens.concurrencyTokenProvider, concurrencyTokenProviderMock)
      .provideValue(coreTokens.dryRunResult, completeDryRunResult)
      .injectClass(MutationTestExecutor);
  });

  function arrangeMutationTestReportHelper() {
    mutationTestReportHelperMock.reportMutantStatus.returnsArg(0);
    mutationTestReportHelperMock.reportCheckFailed.returnsArg(0);
    mutationTestReportHelperMock.reportMutantRunResult.returnsArg(0);
    mutationTestReportHelperMock.reportAll.returnsArg(0);
  }

  function arrangeScenario(overrides?: {
    mutantRunPlan?: MutantRunPlan;
    checkResult?: CheckResult;
    mutantRunResult?: MutantRunResult;
    dryRunTestResult?: TestResult[];
  }) {
    checker.check.resolves([[overrides?.mutantRunPlan ?? mutantRunPlan(), overrides?.checkResult ?? factory.checkResult()]]);
    testRunner.mutantRun.resolves(overrides?.mutantRunResult ?? factory.survivedMutantRunResult());
    completeDryRunResult.tests = overrides?.dryRunTestResult ?? [factory.testResult()];
    arrangeMutationTestReportHelper();
  }

  describe('early result', () => {
    it('should short circuit ignored mutants (not check or run them)', async () => {
      // Arrange
      mutantTestPlans.push(ignoredEarlyResultPlan({ id: '1', statusReason: '1 is ignored' }));
      mutantTestPlans.push(ignoredEarlyResultPlan({ id: '2', statusReason: '2 is ignored' }));

      // Act
      const actualResults = await sut.execute();

      // Assert
      expect(testRunner.mutantRun).not.called;
      expect(checker.check).not.called;
      expect(actualResults).lengthOf(2);
    });

    it('should not run mutants that are uncovered by tests', async () => {
      // Arrange
      arrangeScenario();
      mutantTestPlans.push(mutantRunPlan({ id: '1', testFilter: [] }));

      // Act
      await sut.execute();

      // Assert
      expect(testRunner.mutantRun).not.called;
    });

    it('should report an ignored mutant as `Ignored`', async () => {
      // Arrange
      arrangeScenario();
      mutantTestPlans.push(ignoredEarlyResultPlan({ id: '1', statusReason: '1 is ignored' }));

      // Act
      await sut.execute();

      // Assert
      sinon.assert.calledWithExactly(mutationTestReportHelperMock.reportMutantStatus, mutantTestPlans[0].mutant, 'Ignored');
    });

    it('should report an uncovered mutant with `NoCoverage`', async () => {
      // Arrange
      arrangeScenario();
      mutantTestPlans.push(mutantRunPlan({ id: '1', testFilter: [] }));

      // Act
      await sut.execute();

      // Assert
      expect(mutationTestReportHelperMock.reportMutantStatus).calledWithExactly(mutantTestPlans[0].mutant, 'NoCoverage');
    });
  });

  describe('execute check', () => {
    beforeEach(() => {
      testInjector.options.checkers.push('foo');
    });

    it('should report non-passed check results as "checkFailed"', async () => {
      // Arrange
      const mutant = mutantRunPlan({ id: '1' });
      const failedCheckResult = factory.checkResult({ reason: 'Cannot find foo() of `undefined`', status: CheckStatus.CompileError });
      checker.group.resolves([[mutant]]);
      checker.check.resolves([[mutant, failedCheckResult]]);
      mutantTestPlans.push(mutant);

      // Act
      await sut.execute();

      // Assert
      expect(mutationTestReportHelperMock.reportCheckFailed).calledWithExactly(mutantTestPlans[0].mutant, failedCheckResult);
    });

    it('should group mutants buffered by time', async () => {
      // Arrange
      const clock = sinon.useFakeTimers();
      const plan = mutantRunPlan({ id: '1' });
      const plan2 = mutantRunPlan({ id: '2' });
      arrangeMutationTestReportHelper();
      testRunner.mutantRun.resolves(factory.survivedMutantRunResult());
      const secondCheckerTask = new Task<Array<[MutantRunPlan, CheckResult]>>();
      checker.check
        .withArgs(sinon.match.string, [plan])
        .resolves([[plan, factory.checkResult()]])
        .withArgs(sinon.match.string, [plan2])
        .returns(secondCheckerTask.promise)
        .withArgs(sinon.match.string, [plan, plan2])
        .resolves([
          [plan, factory.checkResult()],
          [plan2, factory.checkResult()],
        ]);
      // Add a second checker process
      testInjector.options.checkers.push('bar');
      mutantTestPlans.push(plan, plan2);
      checker.group
        .withArgs('foo', [plan, plan2])
        .resolves([[plan], [plan2]])
        .withArgs('bar', [plan])
        .resolves([[plan]])
        .withArgs('bar', [plan2])
        .resolves([[plan2]]);

      // Act
      const onGoingAct = sut.execute();

      // Assert
      await tick();
      // Assert that checker is called for the first 2 groups
      expect(checker.group).calledOnce;
      expect(checker.check).calledTwice;
      sinon.assert.calledWithExactly(checker.check, 'foo', [plan]);
      sinon.assert.calledWithExactly(checker.check, 'foo', [plan2]);

      // Assert first check resolved, now tick the clock 10s in the future
      clock.tick(10_001);
      await tick();
      // Now the second grouping should have happened
      expect(checker.group).calledTwice;
      expect(checker.check).calledThrice;
      sinon.assert.calledWithExactly(checker.check, 'bar', [plan]);

      // Now resolve the second checker task
      secondCheckerTask.resolve([[plan2, factory.checkResult()]]);
      await onGoingAct;

      // Finally all checks should have been done
      expect(checker.group).calledThrice;
      expect(checker.check).callCount(4);
      sinon.assert.calledWithExactly(checker.check, 'bar', [plan2]);
    });

    it('should short circuit failed checks', async () => {
      // Arrange
      testInjector.options.checkers.push('bar');
      const plan = mutantRunPlan({ id: '1' });
      const plan2 = mutantRunPlan({ id: '2' });
      arrangeMutationTestReportHelper();
      testRunner.mutantRun.resolves(factory.survivedMutantRunResult());
      checker.check
        .withArgs('foo', [plan])
        .resolves([[plan, factory.checkResult({ status: CheckStatus.CompileError })]])
        .withArgs('foo', [plan2])
        .resolves([[plan2, factory.checkResult({ status: CheckStatus.Passed })]])
        .withArgs('bar', [plan2])
        .resolves([[plan2, factory.checkResult({ status: CheckStatus.Passed })]]);
      mutantTestPlans.push(plan, plan2);
      checker.group
        .withArgs('foo', [plan, plan2])
        .resolves([[plan], [plan2]])
        .withArgs('bar', [plan2])
        .resolves([[plan2]]);

      // Act
      const mutantResults = await sut.execute();

      // Assert
      expect(checker.check).calledThrice;
      sinon.assert.neverCalledWith(checker.check, 'bar', [plan]);
      expect(mutantResults).deep.eq([plan.mutant, plan2.mutant]);
    });

    it('should check mutants in groups', async () => {
      // Arrange
      const plan1 = mutantRunPlan({ id: '1' });
      const plan2 = mutantRunPlan({ id: '2' });
      arrangeScenario();
      checker.group.resolves([[plan1], [plan2]]);

      mutantTestPlans.push(plan1);
      mutantTestPlans.push(plan2);

      // Act
      await sut.execute();

      // Assert
      expect(checker.check).calledTwice;
      sinon.assert.calledWithExactly(checker.check, 'foo', [plan1]);
      sinon.assert.calledWithExactly(checker.check, 'foo', [plan2]);
    });

    it('should report failed check mutants only once (#3461)', async () => {
      // Arrange
      const plan1 = mutantRunPlan({ id: '1' });
      const plan2 = mutantRunPlan({ id: '2' });
      const failedCheckResult = factory.failedCheckResult();
      arrangeScenario({ checkResult: failedCheckResult });
      checker.group.resolves([[plan1], [plan2]]);
      mutantTestPlans.push(plan1);
      mutantTestPlans.push(plan2);

      // Act
      await sut.execute();

      // Assert
      expect(mutationTestReportHelperMock.reportCheckFailed).calledTwice;
      sinon.assert.calledWithExactly(mutationTestReportHelperMock.reportCheckFailed, plan1.mutant, failedCheckResult);
      sinon.assert.calledWithExactly(mutationTestReportHelperMock.reportCheckFailed, plan1.mutant, failedCheckResult);
    });

    it('should free checker resources after checking stage is complete', async () => {
      // Arrange
      const plan = mutantRunPlan({ id: '1' });
      mutantTestPlans.push(plan);
      const checkTask = new Task<[[MutantRunPlan, CheckResult]]>();
      const testRunnerTask = new Task<MutantRunResult>();
      testRunner.mutantRun.returns(testRunnerTask.promise);
      checker.group.resolves([[plan]]);
      checker.check.returns(checkTask.promise);

      // Act & assert
      const executePromise = sut.execute();
      checkTask.resolve([[plan, factory.checkResult()]]);
      await tick(2);
      expect(checkerPoolMock.dispose).called;
      expect(concurrencyTokenProviderMock.freeCheckers).called;
      testRunnerTask.resolve(factory.killedMutantRunResult());
      await executePromise;
    });
  });

  describe('execute test', () => {
    it('should schedule mutants to be tested', async () => {
      // Arrange
      arrangeScenario();
      const plan1 = mutantRunPlan({ id: '1' });
      const plan2 = mutantRunPlan({ id: '2' });
      mutantTestPlans.push(plan1, plan2);

      // Act
      await sut.execute();

      // Assert
      expect(testRunnerPoolMock.schedule).calledOnce;
      expect(testRunner.mutantRun).calledWithExactly(plan1.runOptions);
      expect(testRunner.mutantRun).calledWithExactly(plan2.runOptions);
    });

    it('should sort the mutants that reload the environment last', async () => {
      // Arrange
      arrangeScenario();
      const plan1 = mutantRunPlan({ id: '1', reloadEnvironment: true });
      const plan2 = mutantRunPlan({ id: '2', reloadEnvironment: false });
      const plan3 = mutantRunPlan({ id: '3', reloadEnvironment: true });
      mutantTestPlans.push(plan1, plan2, plan3);

      // Act
      await sut.execute();

      // Assert
      sinon.assert.callOrder(
        testRunner.mutantRun.withArgs(plan2.runOptions),
        testRunner.mutantRun.withArgs(plan1.runOptions),
        testRunner.mutantRun.withArgs(plan3.runOptions),
      );
    });

    it('should report mutant run results', async () => {
      // Arrange
      const plan = mutantRunPlan({ static: true });
      const mutantRunResult = factory.killedMutantRunResult({ status: MutantRunStatus.Killed });
      mutantTestPlans.push(plan);
      arrangeScenario({ mutantRunResult });

      // Act
      await sut.execute();

      // Assert
      expect(mutationTestReportHelperMock.reportMutantRunResult).calledWithExactly(plan.mutant, mutantRunResult);
    });
  });

  it('should log a done message when it is done', async () => {
    // Arrange
    timerMock.humanReadableElapsed.returns('2 seconds, tops!');

    // Act
    await sut.execute();

    // Assert
    expect(testInjector.logger.info).calledWithExactly('Done in %s.', '2 seconds, tops!');
  });

  it('should short circuit when dryRunOnly is enabled', async () => {
    // Arrange
    testInjector.options.dryRunOnly = true;
    arrangeScenario();
    const plan1 = mutantRunPlan({ id: '1' });
    const plan2 = mutantRunPlan({ id: '2' });
    mutantTestPlans.push(plan1, plan2);

    // Act
    const actualResults = await sut.execute();

    // Assert
    expect(mutantTestPlannerMock.makePlan).not.called;
    expect(testRunner.mutantRun).not.called;
    expect(checker.check).not.called;
    expect(actualResults).empty;
  });

  it('should short circuit when no tests found and allowEmpty is enabled', async () => {
    // Arrange
    testInjector.options.allowEmpty = true;
    arrangeScenario({ dryRunTestResult: [] });
    const plan1 = mutantRunPlan({ id: '1' });
    const plan2 = mutantRunPlan({ id: '2' });
    mutantTestPlans.push(plan1, plan2);

    // Act
    const actualResults = await sut.execute();

    // Assert
    expect(mutantTestPlannerMock.makePlan).not.called;
    expect(testRunner.mutantRun).not.called;
    expect(checker.check).not.called;
    expect(actualResults).empty;
  });

  it('should not short circuit if no tests found and allowEmpty is disabled', async () => {
    // Arrange
    testInjector.options.allowEmpty = false;
    arrangeScenario({ dryRunTestResult: [] });
    const plan1 = mutantRunPlan({ id: '1' });
    const plan2 = mutantRunPlan({ id: '2' });
    mutantTestPlans.push(plan1, plan2);

    // Act
    const actualResults = await sut.execute();

    // Assert
    expect(mutantTestPlannerMock.makePlan).called;
    expect(testRunner.mutantRun).calledWithExactly(plan1.runOptions);
    expect(testRunner.mutantRun).calledWithExactly(plan2.runOptions);
    expect(actualResults).deep.eq([plan1.mutant, plan2.mutant]);
  });
});
