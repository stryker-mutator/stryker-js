import { expect } from 'chai';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { Reporter, MutantStatus } from '@stryker-mutator/api/report';
import { TestRunner2, MutantRunStatus, MutantRunOptions } from '@stryker-mutator/api/test_runner2';

import sinon = require('sinon');

import { MutationTestExecutor } from '../../../src/process';
import { coreTokens } from '../../../src/di';
import { createTestRunnerPoolMock, createMutantTestCoverage, TestRunnerPoolMock } from '../../helpers/producers';
import { MutantTestCoverage } from '../../../src/mutants/MutantTestMatcher2';
import { MutationTestReportCalculator } from '../../../src/reporters/MutationTestReportCalculator';
import Timer from '../../../src/utils/Timer';

describe(MutationTestExecutor.name, () => {
  let reporterMock: Required<Reporter>;
  let testRunnerPoolMock: TestRunnerPoolMock;
  let sut: MutationTestExecutor;
  let mutants: MutantTestCoverage[];
  let mutationTestReportCalculatorMock: sinon.SinonStubbedInstance<MutationTestReportCalculator>;
  let timerMock: sinon.SinonStubbedInstance<Timer>;
  let testRunner1: sinon.SinonStubbedInstance<Required<TestRunner2>>;
  let testRunner2: sinon.SinonStubbedInstance<Required<TestRunner2>>;

  beforeEach(() => {
    reporterMock = factory.reporter();
    mutationTestReportCalculatorMock = sinon.createStubInstance(MutationTestReportCalculator);
    timerMock = sinon.createStubInstance(Timer);
    testRunner1 = factory.testRunner();
    testRunner2 = factory.testRunner();
    testRunnerPoolMock = createTestRunnerPoolMock();

    mutants = [];
    sut = testInjector.injector
      .provideValue(coreTokens.reporter, reporterMock)
      .provideValue(coreTokens.testRunnerPool, testRunnerPoolMock)
      .provideValue(coreTokens.timeOverheadMS, 42)
      .provideValue(coreTokens.mutantsWithTestCoverage, mutants)
      .provideValue(coreTokens.mutationTestReportCalculator, mutationTestReportCalculatorMock)
      .provideValue(coreTokens.timer, timerMock)
      .provideValue(coreTokens.testRunnerPool, testRunnerPoolMock)
      .injectClass(MutationTestExecutor);
  });

  it('should run the mutants in the test runners from the test runner pool', async () => {
    // Arrange
    testRunnerPoolMock.testRunner$.next(testRunner1);
    testRunnerPoolMock.testRunner$.next(testRunner2);
    const mutant1 = factory.mutant({ id: 1 });
    const mutant2 = factory.mutant({ id: 2 });
    mutants.push(createMutantTestCoverage({ mutant: mutant1 }));
    mutants.push(createMutantTestCoverage({ mutant: mutant2 }));
    testRunner1.mutantRun.resolves(factory.survivedMutantRunResult());
    testRunner2.mutantRun.resolves(factory.survivedMutantRunResult());

    // Act
    await sut.execute();

    // Assert
    expect(testRunner1.mutantRun).calledOnce;
    expect(testRunner1.mutantRun).calledWithMatch({ activeMutant: mutant1 });
    expect(testRunner2.mutantRun).calledOnce;
    expect(testRunner2.mutantRun).calledWithMatch({ activeMutant: mutant2 });
  });

  it('should calculate timeout correctly', async () => {
    // Arrange
    testRunnerPoolMock.testRunner$.next(testRunner1);
    mutants.push(createMutantTestCoverage({ mutant: factory.mutant({ id: 1 }), estimatedNetTime: 10 }));
    testInjector.options.timeoutFactor = 1.5;
    testInjector.options.timeoutMS = 27;
    testRunner1.mutantRun.resolves(factory.survivedMutantRunResult());

    // Act
    await sut.execute();

    // Assert
    const expected: Partial<MutantRunOptions> = { timeout: 84 }; // 42 (overhead) + 10*1.5 + 27
    expect(testRunner1.mutantRun).calledWithMatch(expected);
  });

  it('should passthrough the test filter', async () => {
    // Arrange
    const expectedTestFilter = ['spec1', 'foo', 'bar'];
    testRunnerPoolMock.testRunner$.next(testRunner1);
    mutants.push(createMutantTestCoverage({ testFilter: expectedTestFilter }));
    testInjector.options.timeoutFactor = 1.5;
    testInjector.options.timeoutMS = 27;
    testRunner1.mutantRun.resolves(factory.survivedMutantRunResult());

    // Act
    await sut.execute();

    // Assert
    const expected: Partial<MutantRunOptions> = { testFilter: expectedTestFilter };
    expect(testRunner1.mutantRun).calledWithMatch(expected);
  });

  it('should recycle a test runner after it is done with it', async () => {
    // Arrange
    testRunnerPoolMock.testRunner$.next(testRunner1); // schedule only one test runner
    testRunnerPoolMock.recycle.callsFake((testRunner) => testRunnerPoolMock.testRunner$.next(testRunner));
    const mutant1 = factory.mutant({ id: 1 });
    const mutant2 = factory.mutant({ id: 2 });
    mutants.push(createMutantTestCoverage({ mutant: mutant1 }));
    mutants.push(createMutantTestCoverage({ mutant: mutant2 }));
    testRunner1.mutantRun.resolves(factory.survivedMutantRunResult());
    testRunner2.mutantRun.resolves(factory.survivedMutantRunResult());

    // Act
    await sut.execute();

    // Assert
    expect(testRunner1.mutantRun).calledTwice;
    expect(testRunner1.mutantRun).calledWithMatch({ activeMutant: mutant1 });
    expect(testRunner1.mutantRun).calledWithMatch({ activeMutant: mutant2 });
    expect(testRunner2.mutantRun).not.called;
  });

  it('should not run mutants that are uncovered by tests', async () => {
    // Arrange
    testRunnerPoolMock.testRunner$.next(testRunner1);
    const mutant1 = factory.mutant({ id: 1 });
    mutants.push(createMutantTestCoverage({ mutant: mutant1, coveredByTests: false }));

    // Act
    await sut.execute();

    // Assert
    expect(testRunner1.mutantRun).not.called;
    expect(testRunnerPoolMock.recycle).calledWith(testRunner1);
  });

  it('should report an uncovered mutant with `NoCoverage`', async () => {
    // Arrange
    testRunnerPoolMock.testRunner$.next(testRunner1);
    const mutant = createMutantTestCoverage({ mutant: factory.mutant({ id: 1 }), coveredByTests: false });
    mutants.push(mutant);

    // Act
    await sut.execute();

    // Assert
    expect(mutationTestReportCalculatorMock.reportOne).calledWithExactly(mutant, MutantStatus.NoCoverage);
  });

  [
    [MutantStatus.Killed, MutantRunStatus.Killed] as const,
    [MutantStatus.RuntimeError, MutantRunStatus.Error] as const,
    [MutantStatus.Survived, MutantRunStatus.Survived] as const,
    [MutantStatus.TimedOut, MutantRunStatus.Timeout] as const,
  ].forEach(([expected, actual]) => {
    it(`should report ${actual} as ${MutantStatus[expected]}`, async () => {
      // Arrange
      testRunnerPoolMock.testRunner$.next(testRunner1);
      const mutant = createMutantTestCoverage();
      mutants.push(mutant);
      testRunner1.mutantRun.resolves({ status: actual });

      // Act
      await sut.execute();

      // Assert
      expect(mutationTestReportCalculatorMock.reportOne).calledWithExactly(mutant, expected);
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
});
