import { EOL } from 'os';

import { Injector } from 'typed-inject';
import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';
import { TestRunner, CompleteDryRunResult, ErrorDryRunResult, TimeoutDryRunResult, DryRunResult } from '@stryker-mutator/api/test-runner';
import { expect } from 'chai';
import { Observable, mergeMap } from 'rxjs';
import { File, I } from '@stryker-mutator/util';

import { Timer } from '../../../src/utils/timer.js';
import { DryRunContext, DryRunExecutor, MutationTestContext } from '../../../src/process/index.js';
import { coreTokens } from '../../../src/di/index.js';
import { ConfigError } from '../../../src/errors.js';
import { ConcurrencyTokenProvider, Pool } from '../../../src/concurrent/index.js';
import { createTestRunnerPoolMock } from '../../helpers/producers.js';
import { Sandbox } from '../../../src/sandbox/index.js';
import { InputFileCollector } from '../../../src/input/input-file-collector.js';
import { StrictReporter } from '../../../src/reporters/strict-reporter.js';

describe(DryRunExecutor.name, () => {
  let injectorMock: sinon.SinonStubbedInstance<Injector<MutationTestContext>>;
  let testRunnerPoolMock: sinon.SinonStubbedInstance<I<Pool<TestRunner>>>;
  let sut: DryRunExecutor;
  let timerMock: sinon.SinonStubbedInstance<Timer>;
  let testRunnerMock: sinon.SinonStubbedInstance<Required<TestRunner>>;
  let concurrencyTokenProviderMock: sinon.SinonStubbedInstance<ConcurrencyTokenProvider>;
  let sandbox: sinon.SinonStubbedInstance<Sandbox>;
  let inputFiles: InputFileCollector;
  let reporterStub: sinon.SinonStubbedInstance<StrictReporter>;

  beforeEach(() => {
    reporterStub = factory.reporter();
    timerMock = sinon.createStubInstance(Timer);
    testRunnerMock = factory.testRunner();
    testRunnerPoolMock = createTestRunnerPoolMock();
    (
      testRunnerPoolMock.schedule as sinon.SinonStub<
        [Observable<unknown>, (testRunner: TestRunner, arg: unknown) => Promise<DryRunResult>],
        Observable<DryRunResult>
      >
    ).callsFake((item$, task) => item$.pipe(mergeMap((item) => task(testRunnerMock, item))));
    concurrencyTokenProviderMock = sinon.createStubInstance(ConcurrencyTokenProvider);
    injectorMock = factory.injector() as unknown as sinon.SinonStubbedInstance<Injector<MutationTestContext>>;
    injectorMock.resolve.withArgs(coreTokens.testRunnerPool).returns(testRunnerPoolMock as I<Pool<TestRunner>>);
    sandbox = sinon.createStubInstance(Sandbox);
    inputFiles = new InputFileCollector([new File('bar.js', 'console.log("bar")')], ['bar.js'], []);
    injectorMock.resolve.withArgs(coreTokens.inputFiles).returns(inputFiles);
    sut = new DryRunExecutor(
      injectorMock as Injector<DryRunContext>,
      testInjector.logger,
      testInjector.options,
      timerMock,
      concurrencyTokenProviderMock,
      sandbox,
      reporterStub
    );
  });

  it('should pass through any rejections', async () => {
    const expectedError = new Error('expected error');
    testRunnerMock.dryRun.rejects(expectedError);
    await expect(sut.execute()).rejectedWith(expectedError);
  });

  describe('timeout', () => {
    let runResult: CompleteDryRunResult;

    beforeEach(() => {
      runResult = factory.completeDryRunResult();
      testRunnerMock.dryRun.resolves(runResult);
      runResult.tests.push(factory.successTestResult());
    });

    it('should use the configured timeout in ms if option provided', async () => {
      testInjector.options.dryRunTimeoutMinutes = 7.5;
      const timeoutMS = testInjector.options.dryRunTimeoutMinutes * 60 * 1000;
      await sut.execute();
      expect(testRunnerMock.dryRun).calledWithMatch({
        timeout: timeoutMS,
      });
    });

    it('should use the default timeout value if option not provided', async () => {
      const defaultTimeoutMS = 5 * 60 * 1000;
      await sut.execute();
      expect(testRunnerMock.dryRun).calledWithMatch({
        timeout: defaultTimeoutMS,
      });
    });
  });

  describe('disable bail', () => {
    let runResult: CompleteDryRunResult;

    beforeEach(() => {
      runResult = factory.completeDryRunResult();
      testRunnerMock.dryRun.resolves(runResult);
      runResult.tests.push(factory.successTestResult());
    });

    it('should bail by default', async () => {
      await sut.execute();
      expect(testRunnerMock.dryRun).calledWithMatch({
        disableBail: false,
      });
    });

    it('should bail when given the option', async () => {
      testInjector.options.disableBail = true;
      await sut.execute();
      expect(testRunnerMock.dryRun).calledWithMatch({
        disableBail: true,
      });
    });
  });

  describe('files', () => {
    const dryRunFileName = '.sandbox/bar.js';
    let runResult: CompleteDryRunResult;

    beforeEach(() => {
      sandbox.sandboxFileFor.withArgs(inputFiles.filesToMutate[0].name).returns(dryRunFileName);

      runResult = factory.completeDryRunResult();
      testRunnerMock.dryRun.resolves(runResult);
      runResult.tests.push(factory.successTestResult());
    });

    it('should test only for files to mutate', async () => {
      await sut.execute();
      expect(testRunnerMock.dryRun).calledWithMatch({
        files: [dryRunFileName],
      });
    });
  });

  describe('when the dryRun completes', () => {
    let runResult: CompleteDryRunResult;

    beforeEach(() => {
      runResult = factory.completeDryRunResult();
      testRunnerMock.dryRun.resolves(runResult);
    });

    it('should log about that this might take a while', async () => {
      runResult.tests.push(factory.successTestResult());
      await sut.execute();
      expect(testInjector.logger.info).calledWith(
        'Starting initial test run (command test runner with "perTest" coverage analysis). This may take a while.'
      );
    });

    it('should report "onDryRunCompleted" with expected timing', async () => {
      // Arrange
      const expectedOverHeadTimeMs = 90;
      const expectedNetTime = 90;
      runResult.tests.push(factory.successTestResult({ timeSpentMs: expectedNetTime }));
      timerMock.elapsedMs.returns(expectedOverHeadTimeMs + expectedNetTime);

      // Act
      await sut.execute();

      // Assert
      sinon.assert.calledOnceWithExactly(reporterStub.onDryRunCompleted, {
        result: runResult,
        timing: {
          overhead: expectedOverHeadTimeMs,
          net: expectedNetTime,
        },
      });
    });

    describe('with successful tests', () => {
      it('should calculate the overhead time milliseconds', async () => {
        // Arrange
        runResult.tests.push(factory.successTestResult({ timeSpentMs: 10 }));
        runResult.tests.push(factory.successTestResult({ timeSpentMs: 2 }));
        runResult.tests.push(factory.successTestResult({ timeSpentMs: 6 }));
        const expectedOverHeadTimeMs = 82;
        timerMock.elapsedMs.returns(100);

        // Act
        const actualResultInjector = await sut.execute();

        // Assert
        expect(timerMock.mark).calledWith('Initial test run');
        expect(timerMock.elapsedMs).calledWith('Initial test run');
        expect(timerMock.mark).calledBefore(timerMock.elapsedMs);
        expect(actualResultInjector.provideValue).calledWithExactly(coreTokens.timeOverheadMS, expectedOverHeadTimeMs);
      });

      it('should never calculate a negative overhead time', async () => {
        runResult.tests.push(factory.successTestResult({ timeSpentMs: 10 }));
        timerMock.elapsedMs.returns(9);
        const injector = await sut.execute();
        expect(injector.provideValue).calledWithExactly(coreTokens.timeOverheadMS, 0);
      });

      it('should provide the dry run result', async () => {
        timerMock.elapsedMs.returns(42);
        runResult.tests.push(factory.successTestResult());
        runResult.mutantCoverage = {
          perTest: {},
          static: {},
        };
        const actualInjector = await sut.execute();
        expect(actualInjector.provideValue).calledWithExactly(coreTokens.dryRunResult, runResult);
      });

      it('should remap test files that are reported', async () => {
        runResult.tests.push(factory.successTestResult({ fileName: '.stryker-tmp/sandbox-123/test/foo.spec.js' }));
        sandbox.originalFileFor.returns('test/foo.spec.js');
        await sut.execute();
        const actualDryRunResult = injectorMock.provideValue.getCalls().find((call) => call.args[0] === coreTokens.dryRunResult)!
          .args[1] as DryRunResult;
        assertions.expectCompleted(actualDryRunResult);
        expect(actualDryRunResult.tests[0].fileName).eq('test/foo.spec.js');
        expect(sandbox.originalFileFor).calledWith('.stryker-tmp/sandbox-123/test/foo.spec.js');
      });

      it('should remap test locations when type checking was disabled for a test file', async () => {
        runResult.tests.push(
          factory.successTestResult({ fileName: '.stryker-tmp/sandbox-123/test/foo.spec.js', startPosition: { line: 3, column: 1 } }),
          factory.successTestResult({ fileName: '.stryker-tmp/sandbox-123/testResources/foo.spec.js', startPosition: { line: 5, column: 1 } })
        );
        sandbox.originalFileFor
          .withArgs('.stryker-tmp/sandbox-123/test/foo.spec.js')
          .returns('test/foo.spec.js')
          .withArgs('.stryker-tmp/sandbox-123/testResources/foo.spec.js')
          .returns('testResources/foo.spec.js');
        await sut.execute();
        const actualDryRunResult = injectorMock.provideValue.getCalls().find((call) => call.args[0] === coreTokens.dryRunResult)!
          .args[1] as DryRunResult;
        assertions.expectCompleted(actualDryRunResult);
        expect(actualDryRunResult.tests[0].startPosition).deep.eq({ line: 2, column: 1 });
        expect(actualDryRunResult.tests[1].startPosition).deep.eq({ line: 5, column: 1 }); // should not have been remapped, since type checking wasn't disabled here
      });

      it('should have logged the amount of tests ran', async () => {
        runResult.tests.push(factory.successTestResult({ timeSpentMs: 10 }));
        runResult.tests.push(factory.successTestResult({ timeSpentMs: 10 }));
        timerMock.humanReadableElapsed.returns('30 seconds');
        timerMock.humanReadableElapsed.withArgs('Initial test run').returns('2 seconds');
        timerMock.elapsedMs.returns(30000);
        timerMock.elapsedMs.withArgs('Initial test run').returns(2000);

        await sut.execute();

        expect(testInjector.logger.info).to.have.been.calledWith(
          'Initial test run succeeded. Ran %s tests in %s (net %s ms, overhead %s ms).',
          2,
          '2 seconds',
          20,
          1980
        );
      });

      it('should log when there were no tests', async () => {
        await expect(sut.execute()).rejectedWith(
          ConfigError,
          'No tests were executed. Stryker will exit prematurely. Please check your configuration.'
        );
      });
    });
    describe('with failed tests', () => {
      beforeEach(() => {
        runResult.tests.push(factory.failedTestResult({ name: 'foo is bar', failureMessage: 'foo was baz' }));
        runResult.tests.push(factory.failedTestResult({ name: 'bar is baz', failureMessage: 'bar was qux' }));
      });

      it('should have logged the errors', async () => {
        await expect(sut.execute()).rejected;
        expect(testInjector.logger.error).calledWith(
          `One or more tests failed in the initial test run:${EOL}\tfoo is bar${EOL}\t\tfoo was baz${EOL}\tbar is baz${EOL}\t\tbar was qux`
        );
      });

      it('should reject with correct message', async () => {
        await expect(sut.execute()).rejectedWith(ConfigError, 'There were failed tests in the initial test run.');
      });
    });
  });

  describe('when dryRun errors', () => {
    let runResult: ErrorDryRunResult;

    beforeEach(() => {
      runResult = factory.errorDryRunResult();
      testRunnerMock.dryRun.resolves(runResult);
    });

    it('should have logged the errors', async () => {
      runResult.errorMessage = 'cannot call foo() on undefined';
      await expect(sut.execute()).rejected;
      expect(testInjector.logger.error).calledWith(`One or more tests resulted in an error:${EOL}\tcannot call foo() on undefined`);
    });
    it('should reject with correct message', async () => {
      await expect(sut.execute()).rejectedWith('Something went wrong in the initial test run');
    });
  });

  describe('when dryRun timedOut', () => {
    let runResult: TimeoutDryRunResult;

    beforeEach(() => {
      runResult = factory.timeoutDryRunResult();
      testRunnerMock.dryRun.resolves(runResult);
    });

    it('should have logged the timeout', async () => {
      await expect(sut.execute()).rejected;
      expect(testInjector.logger.error).calledWith('Initial test run timed out!');
    });

    it('should reject with correct message', async () => {
      await expect(sut.execute()).rejectedWith('Something went wrong in the initial test run');
    });
  });
});
