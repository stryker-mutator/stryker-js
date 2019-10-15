import { File, LogLevel } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import { RunResult, RunStatus, TestStatus } from '@stryker-mutator/api/test_runner';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { testInjector } from '@stryker-mutator/test-helpers';
import { runResult, testFramework, testResult, transpiler } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import { EOL } from 'os';
import * as sinon from 'sinon';
import { coreTokens } from '../../../src/di';
import InputFileCollection from '../../../src/input/InputFileCollection';
import LoggingClientContext from '../../../src/logging/LoggingClientContext';
import InitialTestExecutor, { InitialTestRunResult } from '../../../src/process/InitialTestExecutor';
import Sandbox from '../../../src/Sandbox';
import * as coverageHooks from '../../../src/transpiler/coverageHooks';
import CoverageInstrumenterTranspiler, * as coverageInstrumenterTranspiler from '../../../src/transpiler/CoverageInstrumenterTranspiler';
import SourceMapper, { PassThroughSourceMapper } from '../../../src/transpiler/SourceMapper';
import { TemporaryDirectory } from '../../../src/utils/TemporaryDirectory';
import Timer from '../../../src/utils/Timer';
import * as producers from '../../helpers/producers';
import { coverageMaps, Mock } from '../../helpers/producers';

const EXPECTED_INITIAL_TIMEOUT = 60 * 1000 * 5;
const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({
  level: LogLevel.Fatal,
  port: 4200
});

describe('InitialTestExecutor run with TranspiledSourceMapper', () => {

  let strykerSandboxMock: producers.Mock<Sandbox>;
  let sut: InitialTestExecutor;
  let testFrameworkMock: TestFramework | null;
  let coverageInstrumenterTranspilerMock: producers.Mock<CoverageInstrumenterTranspiler>;
  let transpilerMock: producers.Mock<Transpiler>;
  let transpiledFiles: File[];
  let coverageAnnotatedFiles: File[];
  let expectedRunResult: RunResult;
  let inputFiles: InputFileCollection;
  let timerMock: sinon.SinonStubbedInstance<Timer>;
  let temporaryDirectoryMock: Mock<TemporaryDirectory>;
  let options: any;

  function createSut() {
    temporaryDirectoryMock = producers.mock(TemporaryDirectory);

    return testInjector.injector
      .provideValue(commonTokens.options, options)
      .provideValue(coreTokens.inputFiles, inputFiles)
      .provideValue(coreTokens.loggingContext, LOGGING_CONTEXT)
      .provideValue(coreTokens.testFramework, testFrameworkMock)
      .provideValue(coreTokens.transpiler, transpilerMock as Transpiler)
      .provideValue(coreTokens.timer, timerMock as unknown as Timer)
      .provideValue(coreTokens.temporaryDirectory, temporaryDirectoryMock as unknown as TemporaryDirectory)
      .injectClass(InitialTestExecutor);
  }

  beforeEach(() => {
    options = { transpilers: ['typescript'], coverageAnalysis: 'perTest'};
    inputFiles = new InputFileCollection([new File('mutate.ts', ''), new File('mutate.d.ts', '')], ['mutate.d.ts', 'mutate.ts']);
    timerMock = sinon.createStubInstance(Timer);
    strykerSandboxMock = producers.mock(Sandbox as any);
    transpilerMock = transpiler();
    coverageInstrumenterTranspilerMock = producers.mock(CoverageInstrumenterTranspiler);
    sinon.stub(Sandbox, 'create').resolves(strykerSandboxMock);
    sinon.stub(coverageInstrumenterTranspiler, 'default').returns(coverageInstrumenterTranspilerMock);
    testFrameworkMock = testFramework();
    coverageAnnotatedFiles = [
      new File('mutate.js', ''),
      new File('mutate.d.ts', ''),
    ];
    transpiledFiles = [
      new File('mutate.ts', ''),
      new File('mutate.d.ts', '')
    ];
    coverageInstrumenterTranspilerMock.transpile.returns(coverageAnnotatedFiles);
    transpilerMock.transpile.returns(transpiledFiles);
    expectedRunResult = runResult();
    strykerSandboxMock.run.resolves(expectedRunResult);
  });

  it('should not throw a SourceMapError', async () => {
    sut = createSut();
    await sut.run();
  });
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
  let temporaryDirectoryMock: Mock<TemporaryDirectory>;

  function createSut() {
    temporaryDirectoryMock = producers.mock(TemporaryDirectory);

    return testInjector.injector
      .provideValue(coreTokens.inputFiles, inputFiles)
      .provideValue(coreTokens.loggingContext, LOGGING_CONTEXT)
      .provideValue(coreTokens.testFramework, testFrameworkMock)
      .provideValue(coreTokens.transpiler, transpilerMock as Transpiler)
      .provideValue(coreTokens.timer, timerMock as unknown as Timer)
      .provideValue(coreTokens.temporaryDirectory, temporaryDirectoryMock as unknown as TemporaryDirectory)
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
    expectedRunResult = runResult();
    strykerSandboxMock.run.resolves(expectedRunResult);
  });

  describe('with input files', () => {

    beforeEach(() => {
      inputFiles = new InputFileCollection([new File('mutate.js', ''), new File('mutate.spec.js', '')], ['mutate.js']);
    });

    it('should create a sandbox with correct arguments', async () => {
      sut = createSut();
      await sut.run();
      expect(Sandbox.create).calledWith(testInjector.injector.resolve(commonTokens.options), 0, coverageAnnotatedFiles, testFrameworkMock);
    });

    it('should initialize, run and dispose the sandbox', async () => {
      sut = createSut();
      await sut.run();
      expect(strykerSandboxMock.run).to.have.been.calledWith(EXPECTED_INITIAL_TIMEOUT);
      expect(strykerSandboxMock.dispose).to.have.been.called;
    });

    it('should calculate the overhead time milliseconds', async () => {
      // Arrange
      const expectedOverHeadTimeMs = 82;
      expectedRunResult.tests[0].timeSpentMs = 10;
      expectedRunResult.tests.push(testResult({ timeSpentMs: 2 }));
      expectedRunResult.tests.push(testResult({ timeSpentMs: 6 }));
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
      const coverageData = coverageMaps();
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
      testInjector.options.transpilers = ['a transpiler'];
      testInjector.logger.isDebugEnabled.returns(true);
      sut = createSut();
      await sut.run();
      const actualLogMessage: string = testInjector.logger.debug.getCall(0).args[0];
      const expectedLogMessage = `Transpiled files: ${JSON.stringify(coverageAnnotatedFiles.map(_ => _.name), null, 2)}`;
      expect(actualLogMessage).eq(expectedLogMessage);
    });

    it('should not log the transpiled results if transpilers are not specified', async () => {
      testInjector.logger.isDebugEnabled.returns(true);
      sut = createSut();
      await sut.run();
      expect(testInjector.logger.debug).not.calledWithMatch('Transpiled files');
    });

    it('should have logged the amount of tests ran', async () => {
      expectedRunResult.tests.push(testResult());
      timerMock.humanReadableElapsed.returns('2 seconds');
      timerMock.elapsedMs.returns(50);
      sut = createSut();
      await sut.run();
      expect(testInjector.logger.info).to.have.been.calledWith('Initial test run succeeded. Ran %s tests in %s (net %s ms, overhead %s ms).',
        2, '2 seconds', 20, 30);
    });

    it('should log when there were no tests', async () => {
      while (expectedRunResult.tests.pop());
      sut = createSut();
      await sut.run();
      expect(testInjector.logger.warn).to.have.been.calledWith('No tests were executed. Stryker will exit prematurely. Please check your configuration.');
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
      expect(coverageInstrumenterTranspiler.default).calledWith(testInjector.injector.resolve(commonTokens.options), ['mutate.min.js']);
      expect(sourceMapperMock.transpiledFileNameFor).calledWith('mutate.js');
    });

    it('should also add a collectCoveragePerTest file when coverage analysis is "perTest" and there is a testFramework', async () => {
      testInjector.options.coverageAnalysis = 'perTest';
      sinon.stub(coverageHooks, 'coveragePerTestHooks').returns('test hook foobar');
      sut = createSut();
      await sut.run();
      expect(strykerSandboxMock.run).calledWith(EXPECTED_INITIAL_TIMEOUT, 'test hook foobar');
    });

    it('should result log a warning if coverage analysis is "perTest" and there is no testFramework', async () => {
      testInjector.options.coverageAnalysis = 'perTest';
      testFrameworkMock = null;
      sut = createSut();
      sinon.stub(coverageHooks, 'coveragePerTestHooks').returns('test hook foobar');
      sut = createSut();
      await sut.run();
      expect(testInjector.logger.warn).calledWith('Cannot measure coverage results per test, there is no testFramework and thus no way of executing code right before and after each test.');
    });

    describe('and run has test failures', () => {
      beforeEach(() => {
        expectedRunResult.tests = [
          testResult({ name: 'foobar test' }),
          testResult({ name: 'example test', status: TestStatus.Failed, failureMessages: ['expected error'] }),
          testResult({ name: '2nd example test', status: TestStatus.Failed })
        ];
      });

      it('should have logged the errors', async () => {
        sut = createSut();
        await expect(sut.run()).rejected;
        expect(testInjector.logger.error).calledWith(`One or more tests failed in the initial test run:${EOL}\texample test${EOL}\t\texpected error${EOL}\t2nd example test`);
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
        expect(testInjector.logger.error).calledWith(`One or more tests resulted in an error:${EOL}\tfoobar${EOL}\texample`);
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
          testResult({ name: 'foobar test' }),
          testResult({ name: 'example test', status: TestStatus.Failed })];
      });

      it('should have logged the timeout', async () => {
        sut = createSut();
        await expect(sut.run()).rejected;
        expect(testInjector.logger.error).calledWith(`Initial test run timed out! Ran following tests before timeout:${EOL}\tfoobar test (Success)${EOL}\texample test (Failed)`);
      });

      it('should reject with correct message', async () => {
        sut = createSut();
        await expect(sut.run()).rejectedWith('Something went wrong in the initial test run');
      });
    });
  });
});
