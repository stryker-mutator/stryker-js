import sinon = require('sinon');
import { expect } from 'chai';
import { testInjector, factory, tick } from '@stryker-mutator/test-helpers';
import { Reporter } from '@stryker-mutator/api/report';
import { TestRunner2, MutantRunStatus, MutantRunOptions, MutantRunResult } from '@stryker-mutator/api/test_runner2';
import { Checker, CheckStatus, CheckResult } from '@stryker-mutator/api/check';
import { Task } from '@stryker-mutator/util';

import { MutationTestExecutor } from '../../../src/process';
import { coreTokens } from '../../../src/di';
import { createTestRunnerPoolMock, createMutantTestCoverage, PoolMock, createCheckerPoolMock } from '../../helpers/producers';
import { MutantTestCoverage } from '../../../src/mutants/findMutantTestCoverage';
import { MutationTestReportHelper } from '../../../src/reporters/MutationTestReportHelper';
import Timer from '../../../src/utils/Timer';
import { ConcurrencyTokenProvider } from '../../../src/concurrent';
import { Sandbox } from '../../../src/sandbox';

describe(MutationTestExecutor.name, () => {
  let reporterMock: Required<Reporter>;
  let testRunnerPoolMock: PoolMock<TestRunner2>;
  let checkerPoolMock: PoolMock<Checker>;
  let sut: MutationTestExecutor;
  let mutants: MutantTestCoverage[];
  let checker1: sinon.SinonStubbedInstance<Checker>;
  let checker2: sinon.SinonStubbedInstance<Checker>;
  let mutationTestReportCalculatorMock: sinon.SinonStubbedInstance<MutationTestReportHelper>;
  let timerMock: sinon.SinonStubbedInstance<Timer>;
  let testRunner1: sinon.SinonStubbedInstance<Required<TestRunner2>>;
  let testRunner2: sinon.SinonStubbedInstance<Required<TestRunner2>>;
  let concurrencyTokenProviderMock: sinon.SinonStubbedInstance<ConcurrencyTokenProvider>;
  let sandboxMock: sinon.SinonStubbedInstance<Sandbox>;

  beforeEach(() => {
    reporterMock = factory.reporter();
    mutationTestReportCalculatorMock = sinon.createStubInstance(MutationTestReportHelper);
    timerMock = sinon.createStubInstance(Timer);
    testRunner1 = factory.testRunner();
    testRunner2 = factory.testRunner();
    testRunnerPoolMock = createTestRunnerPoolMock();
    checkerPoolMock = createCheckerPoolMock();
    checker1 = factory.checker();
    checker2 = factory.checker();
    concurrencyTokenProviderMock = sinon.createStubInstance(ConcurrencyTokenProvider);
    sandboxMock = sinon.createStubInstance(Sandbox);

    mutants = [];
    sut = testInjector.injector
      .provideValue(coreTokens.reporter, reporterMock)
      .provideValue(coreTokens.checkerPool, checkerPoolMock)
      .provideValue(coreTokens.testRunnerPool, testRunnerPoolMock)
      .provideValue(coreTokens.timeOverheadMS, 42)
      .provideValue(coreTokens.mutantsWithTestCoverage, mutants)
      .provideValue(coreTokens.mutationTestReportHelper, mutationTestReportCalculatorMock)
      .provideValue(coreTokens.sandbox, sandboxMock)
      .provideValue(coreTokens.timer, timerMock)
      .provideValue(coreTokens.testRunnerPool, testRunnerPoolMock)
      .provideValue(coreTokens.concurrencyTokenProvider, concurrencyTokenProviderMock)
      .injectClass(MutationTestExecutor);
  });

  function arrangePools() {
    arrangeTestRunners();
    arrangeCheckers();
  }

  function arrangeTestRunners() {
    testRunnerPoolMock.worker$.next(testRunner1);
    testRunnerPoolMock.worker$.next(testRunner2);
    testRunner1.mutantRun.resolves(factory.survivedMutantRunResult());
    testRunner2.mutantRun.resolves(factory.survivedMutantRunResult());
  }

  function arrangeCheckers() {
    checkerPoolMock.worker$.next(checker1);
    checkerPoolMock.worker$.next(checker2);
    checker1.check.resolves(factory.checkResult());
    checker2.check.resolves(factory.checkResult());
  }

  it('should run the mutants in the test runners from the test runner pool', async () => {
    // Arrange
    arrangePools();
    const mutant1 = factory.mutant({ id: 1 });
    const mutant2 = factory.mutant({ id: 2 });
    mutants.push(createMutantTestCoverage({ mutant: mutant1 }));
    mutants.push(createMutantTestCoverage({ mutant: mutant2 }));

    // Act
    await sut.execute();

    // Assert
    expect(testRunner1.mutantRun).calledOnce;
    expect(testRunner1.mutantRun).calledWithMatch({ activeMutant: mutant1 });
    expect(testRunner2.mutantRun).calledOnce;
    expect(testRunner2.mutantRun).calledWithMatch({ activeMutant: mutant2 });
  });

  it('should check the mutants before running them', async () => {
    // Arrange
    arrangePools();
    const mutant1 = factory.mutant({ id: 1 });
    const mutant2 = factory.mutant({ id: 2 });
    mutants.push(createMutantTestCoverage({ mutant: mutant1 }));
    mutants.push(createMutantTestCoverage({ mutant: mutant2 }));

    // Act
    await sut.execute();

    // Assert
    expect(checker1.check).calledOnce;
    expect(checker1.check).calledWithMatch(mutant1);
    expect(checker2.check).calledOnce;
    expect(checker2.check).calledWithMatch(mutant2);
  });

  it('should calculate timeout correctly', async () => {
    // Arrange
    arrangePools();
    mutants.push(createMutantTestCoverage({ mutant: factory.mutant({ id: 1 }), estimatedNetTime: 10 }));
    testInjector.options.timeoutFactor = 1.5;
    testInjector.options.timeoutMS = 27;

    // Act
    await sut.execute();

    // Assert
    const expected: Partial<MutantRunOptions> = { timeout: 84 }; // 42 (overhead) + 10*1.5 + 27
    expect(testRunner1.mutantRun).calledWithMatch(expected);
  });

  it('should passthrough the test filter', async () => {
    // Arrange
    arrangePools();
    const expectedTestFilter = ['spec1', 'foo', 'bar'];
    mutants.push(createMutantTestCoverage({ testFilter: expectedTestFilter }));
    testInjector.options.timeoutFactor = 1.5;
    testInjector.options.timeoutMS = 27;

    // Act
    await sut.execute();

    // Assert
    const expected: Partial<MutantRunOptions> = { testFilter: expectedTestFilter };
    expect(testRunner1.mutantRun).calledWithMatch(expected);
  });

  it('should provide the sandboxFileName', async () => {
    // Arrange
    arrangePools();
    const expectedTestFilter = ['spec1', 'foo', 'bar'];
    sandboxMock.sandboxFileFor.returns('.stryker-tmp/sandbox1234/src/foo.js');
    mutants.push(createMutantTestCoverage({ testFilter: expectedTestFilter, mutant: factory.mutant({ fileName: 'src/foo.js' }) }));
    testInjector.options.timeoutFactor = 1.5;
    testInjector.options.timeoutMS = 27;

    // Act
    await sut.execute();

    // Assert
    const expected: Partial<MutantRunOptions> = { sandboxFileName: '.stryker-tmp/sandbox1234/src/foo.js' };
    expect(testRunner1.mutantRun).calledWithMatch(expected);
    expect(sandboxMock.sandboxFileFor).calledWithExactly('src/foo.js');
  });

  it('should recycle a test runner after it is done with it', async () => {
    // Arrange
    arrangeCheckers();
    testRunnerPoolMock.worker$.next(testRunner1); // schedule only one test runner
    testRunnerPoolMock.recycle.callsFake((testRunner) => testRunnerPoolMock.worker$.next(testRunner));
    const mutant1 = factory.mutant({ id: 1 });
    const mutant2 = factory.mutant({ id: 2 });
    mutants.push(createMutantTestCoverage({ mutant: mutant1 }));
    mutants.push(createMutantTestCoverage({ mutant: mutant2 }));
    testRunner1.mutantRun.resolves(factory.survivedMutantRunResult());

    // Act
    await sut.execute();

    // Assert
    expect(testRunner1.mutantRun).calledTwice;
    expect(testRunner1.mutantRun).calledWithMatch({ activeMutant: mutant1 });
    expect(testRunner1.mutantRun).calledWithMatch({ activeMutant: mutant2 });
    expect(testRunner2.mutantRun).not.called;
  });

  it('should recycle a checker after it is done with it', async () => {
    // Arrange
    arrangeTestRunners();
    checkerPoolMock.worker$.next(checker1); // schedule only one
    checkerPoolMock.recycle.callsFake((testRunner) => checkerPoolMock.worker$.next(testRunner));
    const mutant1 = factory.mutant({ id: 1 });
    const mutant2 = factory.mutant({ id: 2 });
    mutants.push(createMutantTestCoverage({ mutant: mutant1 }));
    mutants.push(createMutantTestCoverage({ mutant: mutant2 }));
    checker1.check.resolves(factory.checkResult());

    // Act
    await sut.execute();

    // Assert
    expect(checker1.check).calledTwice;
    expect(checker1.check).calledWithMatch(mutant1);
    expect(checker1.check).calledWithMatch(mutant2);
    expect(checker2.check).not.called;
  });

  it('should not run mutants that are uncovered by tests', async () => {
    // Arrange
    arrangePools();
    const mutant1 = factory.mutant({ id: 1 });
    mutants.push(createMutantTestCoverage({ mutant: mutant1, coveredByTests: false }));

    // Act
    await sut.execute();

    // Assert
    expect(testRunner1.mutantRun).not.called;
  });

  it('should report an uncovered mutant with `NoCoverage`', async () => {
    // Arrange
    arrangePools();
    const mutant = factory.mutant({ id: 1 });
    mutants.push(createMutantTestCoverage({ mutant: factory.mutant({ id: 1 }), coveredByTests: false }));

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportCalculatorMock.reportNoCoverage).calledWithExactly(mutant);
  });

  it('should report non-passed check results as "checkFailed"', async () => {
    // Arrange
    checkerPoolMock.worker$.next(checker1);
    const mutant = factory.mutant({ id: 1 });
    const failedCheckResult = factory.checkResult({ reason: 'Cannot find foo() of `undefined`', status: CheckStatus.CompileError });
    checker1.check.resolves(failedCheckResult);
    mutants.push(createMutantTestCoverage({ mutant }));

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportCalculatorMock.reportCheckFailed).calledWithExactly(mutant, failedCheckResult);
  });

  it('should free checker resources after checking stage is complete', async () => {
    // Arrange
    checkerPoolMock.worker$.next(checker1);
    testRunnerPoolMock.worker$.next(testRunner1);
    mutants.push(createMutantTestCoverage({ mutant: factory.mutant({ id: 1 }) }));
    const checkTask = new Task<CheckResult>();
    const testRunnerTask = new Task<MutantRunResult>();
    testRunner1.mutantRun.returns(testRunnerTask.promise);
    checker1.check.returns(checkTask.promise);

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
    arrangeCheckers();
    testRunnerPoolMock.worker$.next(testRunner1);
    const mutant = createMutantTestCoverage();
    const mutantRunResult = factory.killedMutantRunResult({ status: MutantRunStatus.Killed });
    mutants.push(mutant);
    testRunner1.mutantRun.resolves(mutantRunResult);

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
