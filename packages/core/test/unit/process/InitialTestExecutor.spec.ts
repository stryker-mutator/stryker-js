import { EOL } from 'os';
import { expect } from 'chai';
import Sandbox from '../../../src/Sandbox';
import InitialTestExecutor, { InitialTestRunResult } from '../../../src/process/InitialTestExecutor';
import { File, LogLevel } from '@stryker-mutator/api/core';
import * as producers from '../../helpers/producers';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import CoverageInstrumenterTranspiler, * as coverageInstrumenterTranspiler from '../../../src/transpiler/CoverageInstrumenterTranspiler';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { RunStatus, RunResult, TestStatus } from '@stryker-mutator/api/test_runner';
import Timer from '../../../src/utils/Timer';
import { COVERAGE_MAPS } from '../../helpers/producers';
import InputFileCollection from '../../../src/input/InputFileCollection';
import * as coverageHooks from '../../../src/transpiler/coverageHooks';
import SourceMapper, { PassThroughSourceMapper } from '../../../src/transpiler/SourceMapper';
import LoggingClientContext from '../../../src/logging/LoggingClientContext';
import * as sinon from 'sinon';
import { TEST_INJECTOR } from '@stryker-mutator/test-helpers';
import { transpiler, testFramework, TEST_RESULT, RUN_RESULT } from '@stryker-mutator/test-helpers/src/factory';
import { coreTokens } from '../../../src/di';
import { COMMON_TOKENS } from '@stryker-mutator/api/plugin';

const expectedInitialTimeout = 60 * 1000 * 5;
const loggingContext: LoggingClientContext = Object.freeze({
  level: LogLevel.Fatal,
  port: 4200
});

describe('InitialTestExecutor run', () => {

  let strykerSandboxMock: producers.Mock<Sandbox>;
  let sut: InitialTestExecutor;
  let testFrameworkMock: TestFramework | null;
  let coverageInstrumenterTranspilerMock: producers.Mock<CoverageInstrumenterTranspiler>;
  let transpilerMock: producers.Mock<Transpiler>;
  let transpiledFiles: File[];
  let coverageAnnotatedFiles: File[];
  let sourceMapperMock: producers.Mock<SourceMapper>;
  let expectedRunResult: RunResult;
  let inputFiles: InputFileCollection;
  let timerMock: sinon.SinonStubbedInstance<Timer>;

  function createSut() {
    return TEST_INJECTOR.injector
      .provideValue(coreTokens.InputFiles, inputFiles)
      .provideValue(coreTokens.LoggingContext, loggingContext)
      .provideValue(coreTokens.TestFramework, testFrameworkMock)
      .provideValue(coreTokens.Transpiler, transpilerMock as Transpiler)
      .provideValue(coreTokens.Timer, timerMock as unknown as Timer)
      .injectClass(InitialTestExecutor);
  }

  beforeEach(() => {
    timerMock = sinon.createStubInstance(Timer);
    strykerSandboxMock = producers.mock(Sandbox as any);
    transpilerMock = transpiler();
    coverageInstrumenterTranspilerMock = producers.mock(CoverageInstrumenterTranspiler);
    sinon.stub(Sandbox, 'create').resolves(strykerSandboxMock);
    sinon.stub(coverageInstrumenterTranspiler, 'default').returns(coverageInstrumenterTranspilerMock);
    sourceMapperMock = producers.mock(PassThroughSourceMapper);
    sinon.stub(SourceMapper, 'create').returns(sourceMapperMock);
    testFrameworkMock = testFramework();
    coverageAnnotatedFiles = [
      new File('cov-annotated-transpiled-file-1.js', ''),
      new File('cov-annotated-transpiled-file-2.js', ''),
    ];
    transpiledFiles = [
      new File('transpiled-file-1.js', ''),
      new File('transpiled-file-2.js', '')
    ];
    coverageInstrumenterTranspilerMock.transpile.returns(coverageAnnotatedFiles);
    transpilerMock.transpile.returns(transpiledFiles);
    expectedRunResult = RUN_RESULT();
    strykerSandboxMock.run.resolves(expectedRunResult);
  });

  describe('with input files', () => {

    beforeEach(() => {
      inputFiles = new InputFileCollection([new File('mutate.js', ''), new File('mutate.spec.js', '')], ['mutate.js']);
    });

    it('should create a sandbox with correct arguments', async () => {
      sut = createSut();
      await sut.run();
      expect(Sandbox.create).calledWith(TEST_INJECTOR.injector.resolve(COMMON_TOKENS.options), 0, coverageAnnotatedFiles, testFrameworkMock);
    });

    it('should initialize, run and dispose the sandbox', async () => {
      sut = createSut();
      await sut.run();
      expect(strykerSandboxMock.run).to.have.been.calledWith(expectedInitialTimeout);
      expect(strykerSandboxMock.dispose).to.have.been.called;
    });

    it('should calculate the overhead time milliseconds', async () => {
      // Arrange
      const expectedOverHeadTimeMs = 82;
      expectedRunResult.tests[0].timeSpentMs = 10;
      expectedRunResult.tests.push(TEST_RESULT({ timeSpentMs: 2 }));
      expectedRunResult.tests.push(TEST_RESULT({ timeSpentMs: 6 }));
      timerMock.elapsedMs.returns(100);
      sut = createSut();

      // Act
      const { overheadTimeMS } = await sut.run();

      // Assert
      expect(timerMock.mark).calledWith('Initial test run');
      expect(timerMock.elapsedMs).calledWith('Initial test run');
      expect(timerMock.mark).calledBefore(timerMock.elapsedMs);
      expect(overheadTimeMS).eq(expectedOverHeadTimeMs);
    });

    it('should never calculate a negative overhead time', async () => {
      expectedRunResult.tests[0].timeSpentMs = 10;
      timerMock.elapsedMs.returns(9);
      sut = createSut();
      const { overheadTimeMS } = await sut.run();
      expect(overheadTimeMS).eq(0);
    });

    it('should pass through the result', async () => {
      const coverageData = COVERAGE_MAPS();
      coverageInstrumenterTranspilerMock.fileCoverageMaps = { someFile: coverageData } as any;
      timerMock.elapsedMs.returns(42);
      const expectedResult: InitialTestRunResult = {
        coverageMaps: {
          someFile: coverageData
        },
        overheadTimeMS: 42 - expectedRunResult.tests[0].timeSpentMs,
        runResult: expectedRunResult,
        sourceMapper: sourceMapperMock
      };
      sut = createSut();
      const actualRunResult = await sut.run();
      expect(actualRunResult).deep.eq(expectedResult);
    });

    it('should log the transpiled results if transpilers are specified', async () => {
      TEST_INJECTOR.options.transpilers = ['a transpiler'];
      TEST_INJECTOR.logger.isDebugEnabled.returns(true);
      sut = createSut();
      await sut.run();
      const actualLogMessage: string = TEST_INJECTOR.logger.debug.getCall(0).args[0];
      const expectedLogMessage = `Transpiled files: ${JSON.stringify(coverageAnnotatedFiles.map(file => file.name), null, 2)}`;
      expect(actualLogMessage).eq(expectedLogMessage);
    });

    it('should not log the transpiled results if transpilers are not specified', async () => {
      TEST_INJECTOR.logger.isDebugEnabled.returns(true);
      await sut.run();
      expect(TEST_INJECTOR.logger.debug).not.calledWithMatch('Transpiled files');
    });

    it('should have logged the amount of tests ran', async () => {
      expectedRunResult.tests.push(TEST_RESULT());
      timerMock.humanReadableElapsed.returns('2 seconds');
      timerMock.elapsedMs.returns(50);
      sut = createSut();
      await sut.run();
      expect(TEST_INJECTOR.logger.info).to.have.been.calledWith('Initial test run succeeded. Ran %s tests in %s (net %s ms, overhead %s ms).',
        2, '2 seconds', 20, 30);
    });

    it('should log when there were no tests', async () => {
      while (expectedRunResult.tests.pop());
      sut = createSut();
      await sut.run();
      expect(TEST_INJECTOR.logger.warn).to.have.been.calledWith('No tests were executed. Stryker will exit prematurely. Please check your configuration.');
    });

    it('should pass through any rejections', async () => {
      const expectedError = new Error('expected error');
      strykerSandboxMock.run.rejects(expectedError);
      sut = createSut();
      await expect(sut.run()).rejectedWith(expectedError);
    });

    it('should create the coverage instrumenter transpiler with source-mapped files to mutate', async () => {
      sourceMapperMock.transpiledFileNameFor.returns('mutate.min.js');
      sut = createSut();
      await sut.run();
      expect(coverageInstrumenterTranspiler.default).calledWithNew;
      expect(coverageInstrumenterTranspiler.default).calledWith(TEST_INJECTOR.injector.resolve(COMMON_TOKENS.options), ['mutate.min.js']);
      expect(sourceMapperMock.transpiledFileNameFor).calledWith('mutate.js');
    });

    it('should also add a collectCoveragePerTest file when coverage analysis is "perTest" and there is a testFramework', async () => {
      TEST_INJECTOR.options.coverageAnalysis = 'perTest';
      sinon.stub(coverageHooks, 'coveragePerTestHooks').returns('test hook foobar');
      sut = createSut();
      await sut.run();
      expect(strykerSandboxMock.run).calledWith(expectedInitialTimeout, 'test hook foobar');
    });

    it('should result log a warning if coverage analysis is "perTest" and there is no testFramework', async () => {
      TEST_INJECTOR.options.coverageAnalysis = 'perTest';
      testFrameworkMock = null;
      sut = createSut();
      sinon.stub(coverageHooks, 'coveragePerTestHooks').returns('test hook foobar');
      sut = createSut();
      await sut.run();
      expect(TEST_INJECTOR.logger.warn).calledWith('Cannot measure coverage results per test, there is no testFramework and thus no way of executing code right before and after each test.');
    });

    describe('and run has test failures', () => {
      beforeEach(() => {
        expectedRunResult.tests = [
          TEST_RESULT({ name: 'foobar test' }),
          TEST_RESULT({ name: 'example test', status: TestStatus.Failed, failureMessages: ['expected error'] }),
          TEST_RESULT({ name: '2nd example test', status: TestStatus.Failed })
        ];
      });

      it('should have logged the errors', async () => {
        sut = createSut();
        await expect(sut.run()).rejected;
        expect(TEST_INJECTOR.logger.error).calledWith(`One or more tests failed in the initial test run:${EOL}\texample test${EOL}\t\texpected error${EOL}\t2nd example test`);
      });
      it('should reject with correct message', async () => {
        sut = createSut();
        await expect(sut.run()).rejectedWith('There were failed tests in the initial test run.');
      });
    });

    describe('and run has some errors', () => {

      beforeEach(() => {
        expectedRunResult.status = RunStatus.Error;
        expectedRunResult.errorMessages = ['foobar', 'example'];
      });

      it('should have logged the errors', async () => {
        sut = createSut();
        await expect(sut.run()).rejected;
        expect(TEST_INJECTOR.logger.error).calledWith(`One or more tests resulted in an error:${EOL}\tfoobar${EOL}\texample`);
      });
      it('should reject with correct message', async () => {
        sut = createSut();
        await expect(sut.run()).rejectedWith('Something went wrong in the initial test run');
      });
    });

    describe('and run timed out', () => {
      beforeEach(() => {
        expectedRunResult.status = RunStatus.Timeout;
        expectedRunResult.tests = [
          TEST_RESULT({ name: 'foobar test' }),
          TEST_RESULT({ name: 'example test', status: TestStatus.Failed })];
      });

      it('should have logged the timeout', async () => {
        sut = createSut();
        await expect(sut.run()).rejected;
        expect(TEST_INJECTOR.logger.error).calledWith(`Initial test run timed out! Ran following tests before timeout:${EOL}\tfoobar test (Success)${EOL}\texample test (Failed)`);
      });

      it('should reject with correct message', async () => {
        sut = createSut();
        await expect(sut.run()).rejectedWith('Something went wrong in the initial test run');
      });
    });
  });
});
