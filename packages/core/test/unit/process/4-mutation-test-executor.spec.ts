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

import { MutationTestExecutor } from '../../../src/process';
import { coreTokens } from '../../../src/di';
import { createTestRunnerPoolMock, createCheckerPoolMock } from '../../helpers/producers';
import { MutationTestReportHelper } from '../../../src/reporters/mutation-test-report-helper';
import { Timer } from '../../../src/utils/timer';
import { ConcurrencyTokenProvider, Pool } from '../../../src/concurrent';
import { Sandbox } from '../../../src/sandbox';

describe(MutationTestExecutor.name, () => {
  let reporterMock: Required<Reporter>;
  let testRunnerPoolMock: sinon.SinonStubbedInstance<I<Pool<TestRunner>>>;
  let checkerPoolMock: sinon.SinonStubbedInstance<I<Pool<Checker>>>;
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
    mutants.push(factory.mutantTestCoverage({ id: '1', static: true }));
    mutants.push(factory.mutantTestCoverage({ id: '2', coveredBy: ['1'] }));

    // Act
    await sut.execute();

    // Assert
    expect(testRunnerPoolMock.schedule).calledOnce;
    expect(testRunner.mutantRun).calledWithMatch({ activeMutant: mutants[0] });
    expect(testRunner.mutantRun).calledWithMatch({ activeMutant: mutants[1] });
  });

  it('should short circuit ignored mutants (not check them or run them)', async () => {
    // Arrange
    mutants.push(factory.mutantTestCoverage({ id: '1', status: MutantStatus.Ignored, statusReason: '1 is ignored' }));
    mutants.push(factory.mutantTestCoverage({ id: '2', status: MutantStatus.Ignored, statusReason: '2 is ignored' }));

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
    mutants.push(factory.mutantTestCoverage({ id: '1' }));
    mutants.push(factory.mutantTestCoverage({ id: '2' }));

    // Act
    await sut.execute();

    // Assert
    expect(checker.check).calledTwice;
    expect(checker.check).calledWithMatch(mutants[0]);
    expect(checker.check).calledWithMatch(mutants[1]);
  });

  it('should calculate timeout correctly', async () => {
    // Arrange
    arrangeScenario();
    mutants.push(factory.mutantTestCoverage({ id: '1', estimatedNetTime: 10, coveredBy: ['1'] }));
    testInjector.options.timeoutFactor = 1.5;
    testInjector.options.timeoutMS = 27;

    // Act
    await sut.execute();

    // Assert
    const expected: Partial<MutantRunOptions> = { timeout: 84 }; // 42 (overhead) + 10*1.5 + 27
    expect(testRunner.mutantRun).calledWithMatch(expected);
  });

  it('should calculate the hit limit correctly', async () => {
    arrangeScenario();
    mutants.push(factory.mutantTestCoverage({ hitCount: 7, static: true }));

    // Act
    await sut.execute();

    // Assert
    const expected: Partial<MutantRunOptions> = { hitLimit: 700 }; // 7 * 100
    expect(testRunner.mutantRun).calledWithMatch(expected);
  });

  it('should set the hit limit to undefined when there was no hit count', async () => {
    arrangeScenario();
    mutants.push(factory.mutantTestCoverage({ hitCount: undefined, static: true }));
    const expected: Partial<MutantRunOptions> = { hitLimit: undefined };

    // Act
    await sut.execute();

    // Assert
    expect(testRunner.mutantRun).calledWithMatch(expected);
  });
  it('should passthrough the test filter', async () => {
    // Arrange
    arrangeScenario();
    const expectedTestFilter = ['spec1', 'foo', 'bar'];
    mutants.push(factory.mutantTestCoverage({ coveredBy: expectedTestFilter }));
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
    mutants.push(factory.mutantTestCoverage({ coveredBy: expectedTestFilter, fileName: 'src/foo.js' }));
    testInjector.options.timeoutFactor = 1.5;
    testInjector.options.timeoutMS = 27;

    // Act
    await sut.execute();

    // Assert
    const expected: Partial<MutantRunOptions> = { sandboxFileName: '.stryker-tmp/sandbox1234/src/foo.js' };
    expect(testRunner.mutantRun).calledWithMatch(expected);
    expect(sandboxMock.sandboxFileFor).calledWithExactly('src/foo.js');
  });

  it('should pass disableBail to test runner', async () => {
    // Arrange
    arrangeScenario();
    mutants.push(factory.mutantTestCoverage({ id: '1', coveredBy: ['1'] }));
    testInjector.options.disableBail = true;

    // Act
    await sut.execute();

    // Assert
    const expected: Partial<MutantRunOptions> = { disableBail: true };
    expect(testRunner.mutantRun).calledWithMatch(expected);
  });

  it('should not run mutants that are uncovered by tests', async () => {
    // Arrange
    arrangeScenario();
    mutants.push(factory.mutantTestCoverage({ id: '1', coveredBy: undefined, static: false }));

    // Act
    await sut.execute();

    // Assert
    expect(testRunner.mutantRun).not.called;
  });

  it('should report an ignored mutant as `Ignored`', async () => {
    // Arrange
    arrangeScenario();
    mutants.push(factory.mutantTestCoverage({ id: '1', status: MutantStatus.Ignored, statusReason: '1 is ignored' }));

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportCalculatorMock.reportMutantStatus).calledWithExactly(mutants[0], MutantStatus.Ignored);
  });

  it('should report an uncovered mutant with `NoCoverage`', async () => {
    // Arrange
    arrangeScenario();
    mutants.push(factory.mutantTestCoverage({ id: '1', coveredBy: undefined, status: MutantStatus.NoCoverage }));

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportCalculatorMock.reportMutantStatus).calledWithExactly(mutants[0], MutantStatus.NoCoverage);
  });

  it('should report non-passed check results as "checkFailed"', async () => {
    // Arrange
    const mutant = factory.mutantTestCoverage({ id: '1' });
    const failedCheckResult = factory.checkResult({ reason: 'Cannot find foo() of `undefined`', status: CheckStatus.CompileError });
    checker.check.resolves(failedCheckResult);
    mutants.push(mutant);

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportCalculatorMock.reportCheckFailed).calledWithExactly(mutant, failedCheckResult);
  });

  it('should free checker resources after checking stage is complete', async () => {
    // Arrange
    mutants.push(factory.mutantTestCoverage({ id: '1' }));
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
    const mutant = factory.mutantTestCoverage({ static: true });
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
