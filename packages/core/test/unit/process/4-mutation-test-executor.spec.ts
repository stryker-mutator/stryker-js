import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { Mutant } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/report';
import { MutantRunOptions, MutantRunResult, MutantRunStatus, TestRunner } from '@stryker-mutator/api/test-runner';
import { factory, testInjector, tick } from '@stryker-mutator/test-helpers';
import { I, Task } from '@stryker-mutator/util';
import { expect } from 'chai';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import sinon from 'sinon';

import { ConcurrencyTokenProvider, Pool } from '../../../src/concurrent';
import { coreTokens } from '../../../src/di';
import { MutantTestCoverage } from '../../../src/mutants/find-mutant-test-coverage';
import { MutationTestExecutor } from '../../../src/process';
import { MutationTestReportHelper } from '../../../src/reporters/mutation-test-report-helper';
import { Sandbox } from '../../../src/sandbox';
import { Timer } from '../../../src/utils/timer';
import { createCheckerPoolMock, createMutantTestCoverage, createTestRunnerPoolMock } from '../../helpers/producers';

describe(MutationTestExecutor.name, () => {
  let reporterMock: Required<Reporter>;
  let testRunnerPoolMock: sinon.SinonStubbedInstance<Pool<TestRunner>>;
  let checkerPoolMock: sinon.SinonStubbedInstance<Pool<Checker>>;
  let sut: MutationTestExecutor;
  let mutants: MutantTestCoverage[];
  let checker: sinon.SinonStubbedInstance<Checker>;
  let mutationTestReportCalculatorMock: sinon.SinonStubbedInstance<MutationTestReportHelper>;
  let timerMock: sinon.SinonStubbedInstance<Timer>;
  let testRunner: sinon.SinonStubbedInstance<Required<TestRunner>>;
  let concurrencyTokenProviderMock: sinon.SinonStubbedInstance<ConcurrencyTokenProvider>;
  let sandboxMock: sinon.SinonStubbedInstance<Sandbox>;

  beforeEach(() => {
    reporterMock = factory.reporter();
    mutationTestReportCalculatorMock = sinon.createStubInstance(MutationTestReportHelper);
    timerMock = sinon.createStubInstance(Timer);
    testRunner = factory.testRunner();
    testRunnerPoolMock = createTestRunnerPoolMock();
    checkerPoolMock = createCheckerPoolMock();
    checker = factory.checker();
    concurrencyTokenProviderMock = sinon.createStubInstance(ConcurrencyTokenProvider);
    sandboxMock = sinon.createStubInstance(Sandbox);
    (checkerPoolMock.schedule as sinon.SinonStub<
      [Observable<Mutant>, (testRunner: Checker, arg: Mutant) => Promise<CheckResult>],
      Observable<CheckResult>
    >).callsFake((item$, task) => item$.pipe(mergeMap((item) => task(checker, item))));
    (testRunnerPoolMock.schedule as sinon.SinonStub<
      [Observable<MutantTestCoverage>, (testRunner: TestRunner, arg: MutantTestCoverage) => Promise<MutantRunResult>],
      Observable<MutantRunResult>
    >).callsFake((item$, task) => item$.pipe(mergeMap((item) => task(testRunner, item))));

    mutants = [];
    sut = testInjector.injector
      .provideValue(coreTokens.reporter, reporterMock)
      .provideValue(coreTokens.checkerPool, checkerPoolMock as I<Pool<Checker>>)
      .provideValue(coreTokens.testRunnerPool, testRunnerPoolMock)
      .provideValue(coreTokens.timeOverheadMS, 42)
      .provideValue(coreTokens.mutantsWithTestCoverage, mutants)
      .provideValue(coreTokens.mutationTestReportHelper, mutationTestReportCalculatorMock)
      .provideValue(coreTokens.sandbox, sandboxMock)
      .provideValue(coreTokens.timer, timerMock)
      .provideValue(coreTokens.testRunnerPool, testRunnerPoolMock as I<Pool<TestRunner>>)
      .provideValue(coreTokens.concurrencyTokenProvider, concurrencyTokenProviderMock)
      .injectClass(MutationTestExecutor);
  });

  function arrangeScenario(overrides?: { checkResult?: CheckResult; mutantRunResult?: MutantRunResult }) {
    checker.check.resolves(overrides?.checkResult ?? factory.checkResult());
    testRunner.mutantRun.resolves(overrides?.mutantRunResult ?? factory.survivedMutantRunResult());
  }

  it('should schedule mutants to be tested', async () => {
    // Arrange
    arrangeScenario();
    const mutant1 = factory.mutant({ id: 1 });
    const mutant2 = factory.mutant({ id: 2 });
    mutants.push(createMutantTestCoverage({ mutant: mutant1 }));
    mutants.push(createMutantTestCoverage({ mutant: mutant2 }));

    // Act
    await sut.execute();

    // Assert
    expect(testRunnerPoolMock.schedule).calledOnce;
    expect(testRunner.mutantRun).calledWithMatch({ activeMutant: mutant1 });
    expect(testRunner.mutantRun).calledWithMatch({ activeMutant: mutant2 });
  });

  it('should short circuit ignored mutants (not check them or run them)', async () => {
    // Arrange
    mutants.push(createMutantTestCoverage({ mutant: factory.mutant({ id: 1, ignoreReason: '1 is ignored' }) }));
    mutants.push(createMutantTestCoverage({ mutant: factory.mutant({ id: 2, ignoreReason: '2 is ignored' }) }));

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
    const mutant1 = factory.mutant({ id: 1 });
    const mutant2 = factory.mutant({ id: 2 });
    mutants.push(createMutantTestCoverage({ mutant: mutant1 }));
    mutants.push(createMutantTestCoverage({ mutant: mutant2 }));

    // Act
    await sut.execute();

    // Assert
    expect(checker.check).calledTwice;
    expect(checker.check).calledWithMatch(mutant1);
    expect(checker.check).calledWithMatch(mutant2);
  });

  it('should calculate timeout correctly', async () => {
    // Arrange
    arrangeScenario();
    mutants.push(createMutantTestCoverage({ mutant: factory.mutant({ id: 1 }), estimatedNetTime: 10 }));
    testInjector.options.timeoutFactor = 1.5;
    testInjector.options.timeoutMS = 27;

    // Act
    await sut.execute();

    // Assert
    const expected: Partial<MutantRunOptions> = { timeout: 84 }; // 42 (overhead) + 10*1.5 + 27
    expect(testRunner.mutantRun).calledWithMatch(expected);
  });

  it('should passthrough the test filter', async () => {
    // Arrange
    arrangeScenario();
    const expectedTestFilter = ['spec1', 'foo', 'bar'];
    mutants.push(createMutantTestCoverage({ testFilter: expectedTestFilter }));
    testInjector.options.timeoutFactor = 1.5;
    testInjector.options.timeoutMS = 27;

    // Act
    await sut.execute();

    // Assert
    const expected: Partial<MutantRunOptions> = { testFilter: expectedTestFilter };
    expect(testRunner.mutantRun).calledWithMatch(expected);
  });

  it('should provide the sandboxFileName', async () => {
    // Arrange
    arrangeScenario();
    const expectedTestFilter = ['spec1', 'foo', 'bar'];
    sandboxMock.sandboxFileFor.returns('.stryker-tmp/sandbox1234/src/foo.js');
    mutants.push(createMutantTestCoverage({ testFilter: expectedTestFilter, mutant: factory.mutant({ fileName: 'src/foo.js' }) }));
    testInjector.options.timeoutFactor = 1.5;
    testInjector.options.timeoutMS = 27;

    // Act
    await sut.execute();

    // Assert
    const expected: Partial<MutantRunOptions> = { sandboxFileName: '.stryker-tmp/sandbox1234/src/foo.js' };
    expect(testRunner.mutantRun).calledWithMatch(expected);
    expect(sandboxMock.sandboxFileFor).calledWithExactly('src/foo.js');
  });

  it('should not run mutants that are uncovered by tests', async () => {
    // Arrange
    arrangeScenario();
    const mutant1 = factory.mutant({ id: 1 });
    mutants.push(createMutantTestCoverage({ mutant: mutant1, coveredByTests: false }));

    // Act
    await sut.execute();

    // Assert
    expect(testRunner.mutantRun).not.called;
  });

  it('should report an ignored mutant as `Ignored`', async () => {
    // Arrange
    arrangeScenario();
    const mutant = factory.mutant({ id: 1, ignoreReason: '1 is ignored' });
    mutants.push(createMutantTestCoverage({ mutant, coveredByTests: false }));

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportCalculatorMock.reportMutantIgnored).calledWithExactly(mutant);
  });

  it('should report an uncovered mutant with `NoCoverage`', async () => {
    // Arrange
    arrangeScenario();
    const mutant = factory.mutant({ id: 1 });
    mutants.push(createMutantTestCoverage({ mutant: factory.mutant({ id: 1 }), coveredByTests: false }));

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportCalculatorMock.reportNoCoverage).calledWithExactly(mutant);
  });

  it('should report non-passed check results as "checkFailed"', async () => {
    // Arrange
    const mutant = factory.mutant({ id: 1 });
    const failedCheckResult = factory.checkResult({ reason: 'Cannot find foo() of `undefined`', status: CheckStatus.CompileError });
    checker.check.resolves(failedCheckResult);
    mutants.push(createMutantTestCoverage({ mutant }));

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportCalculatorMock.reportCheckFailed).calledWithExactly(mutant, failedCheckResult);
  });

  it('should free checker resources after checking stage is complete', async () => {
    // Arrange
    mutants.push(createMutantTestCoverage({ mutant: factory.mutant({ id: 1 }) }));
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
    const mutant = createMutantTestCoverage();
    const mutantRunResult = factory.killedMutantRunResult({ status: MutantRunStatus.Killed });
    mutants.push(mutant);
    arrangeScenario({ mutantRunResult });

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportCalculatorMock.reportMutantRunResult).calledWithExactly(mutant, mutantRunResult);
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
