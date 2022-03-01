import sinon from 'sinon';
import { expect } from 'chai';
import { testInjector, factory, tick } from '@stryker-mutator/test-helpers';
import { Reporter } from '@stryker-mutator/api/report';
import { TestRunner, MutantRunOptions, MutantRunResult, MutantRunStatus } from '@stryker-mutator/api/test-runner';
import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Mutant, MutantStatus, MutantTestCoverage } from '@stryker-mutator/api/core';
import { I, Task } from '@stryker-mutator/util';

import { MutationTestExecutor } from '../../../src/process/index.js';
import { coreTokens } from '../../../src/di/index.js';
import { createTestRunnerPoolMock, createCheckerResourcePoolMock, createMutantRunPlan, createMutantEarlyResultPlan } from '../../helpers/producers.js';
import { MutationTestReportHelper } from '../../../src/reporters/mutation-test-report-helper.js';
import { Timer } from '../../../src/utils/timer.js';
import { ConcurrencyTokenProvider, Pool } from '../../../src/concurrent/index.js';
import { Sandbox } from '../../../src/sandbox/index.js';
import { MutantEarlyResultPlan, MutantRunPlan, MutantTestPlan, MutantTestPlanner } from '../../../src/mutants/index.js';

function ignoredEarlyResultPlan(overrides?: Partial<Mutant>): MutantEarlyResultPlan {
  return createMutantEarlyResultPlan({
    mutant: { ...factory.mutant(overrides), status: MutantStatus.Ignored },
  });
}

function mutantRunPlan(overrides?: Partial<MutantRunOptions & MutantTestCoverage>): MutantRunPlan {
  const mutant = factory.mutantTestCoverage(overrides);
  return createMutantRunPlan({
    runOptions: factory.mutantRunOptions({ ...overrides, activeMutant: mutant }),
    mutant,
  });
}

describe(MutationTestExecutor.name, () => {
  let reporterMock: Required<Reporter>;
  let testRunnerPoolMock: sinon.SinonStubbedInstance<I<Pool<TestRunner>>>;
  let checkerPoolMock: sinon.SinonStubbedInstance<I<Pool<Checker>>>;
  let sut: MutationTestExecutor;
  let mutants: MutantTestCoverage[];
  let mutantTestPlans: MutantTestPlan[];
  let checker: sinon.SinonStubbedInstance<Checker>;
  let mutationTestReportHelperMock: sinon.SinonStubbedInstance<MutationTestReportHelper>;
  let mutantTestPlannerMock: sinon.SinonStubbedInstance<MutantTestPlanner>;
  let timerMock: sinon.SinonStubbedInstance<Timer>;
  let testRunner: sinon.SinonStubbedInstance<Required<TestRunner>>;
  let concurrencyTokenProviderMock: sinon.SinonStubbedInstance<ConcurrencyTokenProvider>;
  let sandboxMock: sinon.SinonStubbedInstance<Sandbox>;

  beforeEach(() => {
    reporterMock = factory.reporter();
    mutationTestReportHelperMock = sinon.createStubInstance(MutationTestReportHelper);
    mutantTestPlannerMock = sinon.createStubInstance(MutantTestPlanner);
    timerMock = sinon.createStubInstance(Timer);
    testRunner = factory.testRunner();
    testRunnerPoolMock = createTestRunnerPoolMock();
    checkerPoolMock = createCheckerResourcePoolMock();
    checker = factory.checker();
    concurrencyTokenProviderMock = sinon.createStubInstance(ConcurrencyTokenProvider);
    sandboxMock = sinon.createStubInstance(Sandbox);
    (
      checkerPoolMock.schedule as sinon.SinonStub<
        [Observable<Mutant>, (testRunner: Checker, arg: Mutant) => Promise<CheckResult>],
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
    mutantTestPlannerMock.makePlan.returns(mutantTestPlans);
    sut = testInjector.injector
      .provideValue(coreTokens.reporter, reporterMock)
      .provideValue(coreTokens.checkerPool, checkerPoolMock as I<Pool<Checker>>)
      .provideValue(coreTokens.testRunnerPool, testRunnerPoolMock)
      .provideValue(coreTokens.timeOverheadMS, 42)
      .provideValue(coreTokens.mutants, mutants)
      .provideValue(coreTokens.mutantTestPlanner, mutantTestPlannerMock)
      .provideValue(coreTokens.mutationTestReportHelper, mutationTestReportHelperMock)
      .provideValue(coreTokens.sandbox, sandboxMock)
      .provideValue(coreTokens.timer, timerMock)
      .provideValue(coreTokens.testRunnerPool, testRunnerPoolMock as I<Pool<TestRunner>>)
      .provideValue(coreTokens.concurrencyTokenProvider, concurrencyTokenProviderMock)
      .injectClass(MutationTestExecutor);
  });

  function arrangeScenario(overrides?: { checkResult?: CheckResult; mutantRunResult?: MutantRunResult }) {
    checker.check.resolves(overrides?.checkResult ?? factory.checkResult());
    testRunner.mutantRun.resolves(overrides?.mutantRunResult ?? factory.survivedMutantRunResult());
    mutationTestReportHelperMock.reportMutantStatus.returnsArg(0);
    mutationTestReportHelperMock.reportCheckFailed.returnsArg(0);
    mutationTestReportHelperMock.reportMutantRunResult.returnsArg(0);
    mutationTestReportHelperMock.reportAll.returnsArg(0);
  }

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

  it('should check the mutants before running them', async () => {
    // Arrange
    arrangeScenario();
    mutantTestPlans.push(mutantRunPlan({ id: '1' }));
    mutantTestPlans.push(mutantRunPlan({ id: '2' }));

    // Act
    await sut.execute();

    // Assert
    expect(checker.check).calledTwice;
    expect(checker.check).calledWithMatch(mutantTestPlans[0].mutant);
    expect(checker.check).calledWithMatch(mutantTestPlans[1].mutant);
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
    mutantTestPlans.push(mutantRunPlan({ id: '1', status: MutantStatus.Ignored, statusReason: '1 is ignored' }));

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportHelperMock.reportMutantStatus).calledWithExactly(mutantTestPlans[0].mutant, MutantStatus.Ignored);
  });

  it('should report an uncovered mutant with `NoCoverage`', async () => {
    // Arrange
    arrangeScenario();
    mutantTestPlans.push(mutantRunPlan({ id: '1', testFilter: [] }));

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportHelperMock.reportMutantStatus).calledWithExactly(mutantTestPlans[0].mutant, MutantStatus.NoCoverage);
  });

  it('should report non-passed check results as "checkFailed"', async () => {
    // Arrange
    const mutant = mutantRunPlan({ id: '1' });
    const failedCheckResult = factory.checkResult({ reason: 'Cannot find foo() of `undefined`', status: CheckStatus.CompileError });
    checker.check.resolves(failedCheckResult);
    mutantTestPlans.push(mutant);

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportHelperMock.reportCheckFailed).calledWithExactly(mutantTestPlans[0].mutant, failedCheckResult);
  });

  it('should free checker resources after checking stage is complete', async () => {
    // Arrange
    mutantTestPlans.push(mutantRunPlan({ id: '1' }));
    const checkTask = new Task<CheckResult>();
    const testRunnerTask = new Task<MutantRunResult>();
    testRunner.mutantRun.returns(testRunnerTask.promise);
    checker.check.returns(checkTask.promise);

    // Act & assert
    const executePromise = sut.execute();
    checkTask.resolve(factory.checkResult());
    await tick(2);
    expect(checkerPoolMock.dispose).called;
    expect(concurrencyTokenProviderMock.freeCheckers).called;
    testRunnerTask.resolve(factory.killedMutantRunResult());
    await executePromise;
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

  it('should log a done message when it is done', async () => {
    // Arrange
    timerMock.humanReadableElapsed.returns('2 seconds, tops!');

    // Act
    await sut.execute();

    // Assert
    expect(testInjector.logger.info).calledWithExactly('Done in %s.', '2 seconds, tops!');
  });
});
