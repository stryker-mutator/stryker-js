import { EOL } from 'os';
import { expect } from 'chai';
import { Logger } from 'stryker-api/logging';
import { default as StrykerSandbox } from '../../../src/Sandbox';
import InitialTestExecutor, { InitialTestRunResult } from '../../../src/process/InitialTestExecutor';
import { File, LogLevel } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import * as producers from '../../helpers/producers';
import { TestFramework } from 'stryker-api/test_framework';
import CoverageInstrumenterTranspiler, * as coverageInstrumenterTranspiler from '../../../src/transpiler/CoverageInstrumenterTranspiler';
import TranspilerFacade, * as transpilerFacade from '../../../src/transpiler/TranspilerFacade';
import { TranspilerOptions } from 'stryker-api/transpile';
import { RunStatus, RunResult, TestStatus } from 'stryker-api/test_runner';
import currentLogMock from '../../helpers/logMock';
import Timer from '../../../src/utils/Timer';
import { Mock, coverageMaps } from '../../helpers/producers';
import InputFileCollection from '../../../src/input/InputFileCollection';
import * as coverageHooks from '../../../src/transpiler/coverageHooks';
import SourceMapper, { PassThroughSourceMapper } from '../../../src/transpiler/SourceMapper';
import LoggingClientContext from '../../../src/logging/LoggingClientContext';

const EXPECTED_INITIAL_TIMEOUT = 60 * 1000 * 5;
const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({
  level: LogLevel.Fatal,
  port: 4200
});

describe('InitialTestExecutor run', () => {

  let log: Mock<Logger>;
  let strykerSandboxMock: producers.Mock<StrykerSandbox>;
  let sut: InitialTestExecutor;
  let testFrameworkMock: TestFramework;
  let coverageInstrumenterTranspilerMock: producers.Mock<CoverageInstrumenterTranspiler>;
  let options: Config;
  let transpilerFacadeMock: producers.Mock<TranspilerFacade>;
  let transpiledFiles: File[];
  let coverageAnnotatedFiles: File[];
  let sourceMapperMock: producers.Mock<SourceMapper>;
  let timer: producers.Mock<Timer>;
  let expectedRunResult: RunResult;

  beforeEach(() => {
    log = currentLogMock();
    strykerSandboxMock = producers.mock(StrykerSandbox as any);
    transpilerFacadeMock = producers.mock(TranspilerFacade);
    coverageInstrumenterTranspilerMock = producers.mock(CoverageInstrumenterTranspiler);
    sandbox.stub(StrykerSandbox, 'create').resolves(strykerSandboxMock);
    sandbox.stub(transpilerFacade, 'default').returns(transpilerFacadeMock);
    sandbox.stub(coverageInstrumenterTranspiler, 'default').returns(coverageInstrumenterTranspilerMock);
    sourceMapperMock = producers.mock(PassThroughSourceMapper);
    sandbox.stub(SourceMapper, 'create').returns(sourceMapperMock);
    testFrameworkMock = producers.testFramework();
    coverageAnnotatedFiles = [
      new File('cov-annotated-transpiled-file-1.js', ''),
      new File('cov-annotated-transpiled-file-2.js', ''),
    ];
    transpiledFiles = [
      new File('transpiled-file-1.js', ''),
      new File('transpiled-file-2.js', '')
    ];
    coverageInstrumenterTranspilerMock.transpile.returns(coverageAnnotatedFiles);
    transpilerFacadeMock.transpile.returns(transpiledFiles);
    options = producers.config();
    expectedRunResult = producers.runResult();
    strykerSandboxMock.run.resolves(expectedRunResult);
    timer = producers.mock(Timer);
  });

  describe('with input files', () => {

    let inputFiles: InputFileCollection;

    beforeEach(() => {
      inputFiles = new InputFileCollection([new File('mutate.js', ''), new File('mutate.spec.js', '')], ['mutate.js']);
      sut = new InitialTestExecutor(options, inputFiles, testFrameworkMock, timer as any, LOGGING_CONTEXT);
    });

    it('should create a sandbox with correct arguments', async () => {
      await sut.run();
      expect(StrykerSandbox.create).calledWith(options, 0, coverageAnnotatedFiles, testFrameworkMock);
    });

    it('should create the transpiler with produceSourceMaps = true when coverage analysis is enabled', async () => {
      options.coverageAnalysis = 'all';
      await sut.run();
      const expectedTranspilerOptions: TranspilerOptions = {
        config: options,
        produceSourceMaps: true
      };
      expect(transpilerFacade.default).calledWithNew;
      expect(transpilerFacade.default).calledWith(expectedTranspilerOptions);
    });

    it('should create the transpiler with produceSourceMaps = false when coverage analysis is "off"', async () => {
      options.coverageAnalysis = 'off';
      await sut.run();
      const expectedTranspilerOptions: TranspilerOptions = {
        config: options,
        produceSourceMaps: false
      };
      expect(transpilerFacade.default).calledWith(expectedTranspilerOptions);
    });

    it('should initialize, run and dispose the sandbox', async () => {
      await sut.run();
      expect(strykerSandboxMock.run).to.have.been.calledWith(EXPECTED_INITIAL_TIMEOUT);
      expect(strykerSandboxMock.dispose).to.have.been.called;
    });

    it('should calculate the overhead time milliseconds', async () => {
      // Arrange
      const expectedOverHeadTimeMs = 82;
      expectedRunResult.tests[0].timeSpentMs = 10;
      expectedRunResult.tests.push(producers.testResult({ timeSpentMs: 2 }));
      expectedRunResult.tests.push(producers.testResult({ timeSpentMs: 6 }));
      timer.elapsedMs.returns(100);

      // Act
      const { overheadTimeMS } = await sut.run();

      // Assert
      expect(timer.mark).calledWith('Initial test run');
      expect(timer.elapsedMs).calledWith('Initial test run');
      expect(timer.mark).calledBefore(timer.elapsedMs);
      expect(overheadTimeMS).eq(expectedOverHeadTimeMs);
    });

    it('should never calculate a negative overhead time', async () => {
      expectedRunResult.tests[0].timeSpentMs = 10;
      timer.elapsedMs.returns(9);
      const { overheadTimeMS } = await sut.run();
      expect(overheadTimeMS).eq(0);
    });

    it('should pass through the result', async () => {
      const coverageData = coverageMaps();
      coverageInstrumenterTranspilerMock.fileCoverageMaps = { someFile: coverageData } as any;
      timer.elapsedMs.returns(42);
      const expectedResult: InitialTestRunResult = {
        coverageMaps: {
          someFile: coverageData
        },
        overheadTimeMS: 42 - expectedRunResult.tests[0].timeSpentMs,
        runResult: expectedRunResult,
        sourceMapper: sourceMapperMock
      };
      const actualRunResult = await sut.run();
      expect(actualRunResult).deep.eq(expectedResult);
    });

    it('should log the transpiled results if transpilers are specified', async () => {
      options.transpilers.push('a transpiler');
      log.isDebugEnabled.returns(true);
      await sut.run();
      const actualLogMessage: string = log.debug.getCall(0).args[0];
      const expectedLogMessage = `Transpiled files: ${JSON.stringify(coverageAnnotatedFiles.map(_ => _.name), null, 2)}`;
      expect(actualLogMessage).eq(expectedLogMessage);
    });

    it('should not log the transpiled results if transpilers are not specified', async () => {
      log.isDebugEnabled.returns(true);
      await sut.run();
      expect(log.debug).not.calledWithMatch('Transpiled files');
    });

    it('should have logged the amount of tests ran', async () => {
      expectedRunResult.tests.push(producers.testResult());
      timer.humanReadableElapsed.returns('2 seconds');
      timer.elapsedMs.returns(50);
      await sut.run();
      expect(log.info).to.have.been.calledWith('Initial test run succeeded. Ran %s tests in %s (net %s ms, overhead %s ms).',
        2, '2 seconds', 20, 30);
    });

    it('should log when there were no tests', async () => {
      while (expectedRunResult.tests.pop());
      await sut.run();
      expect(log.warn).to.have.been.calledWith('No tests were executed. Stryker will exit prematurely. Please check your configuration.');
    });

    it('should pass through any rejections', async () => {
      const expectedError = new Error('expected error');
      strykerSandboxMock.run.rejects(expectedError);
      await expect(sut.run()).rejectedWith(expectedError);
    });

    it('should create the coverage instrumenter transpiler with source-mapped files to mutate', async () => {
      sourceMapperMock.transpiledFileNameFor.returns('mutate.min.js');
      await sut.run();
      expect(coverageInstrumenterTranspiler.default).calledWithNew;
      expect(coverageInstrumenterTranspiler.default).calledWith(options, ['mutate.min.js']);
      expect(sourceMapperMock.transpiledFileNameFor).calledWith('mutate.js');
    });

    it('should also add a collectCoveragePerTest file when coverage analysis is "perTest" and there is a testFramework', async () => {
      sandbox.stub(coverageHooks, 'coveragePerTestHooks').returns('test hook foobar');
      await sut.run();
      expect(strykerSandboxMock.run).calledWith(EXPECTED_INITIAL_TIMEOUT, 'test hook foobar');
    });

    it('should result log a warning if coverage analysis is "perTest" and there is no testFramework', async () => {
      sut = new InitialTestExecutor(options, inputFiles, /* test framework */ null, timer as any, LOGGING_CONTEXT);
      sandbox.stub(coverageHooks, 'coveragePerTestHooks').returns('test hook foobar');
      await sut.run();
      expect(log.warn).calledWith('Cannot measure coverage results per test, there is no testFramework and thus no way of executing code right before and after each test.');
    });

    describe('and run has test failures', () => {
      beforeEach(() => {
        expectedRunResult.tests = [
          producers.testResult({ name: 'foobar test' }),
          producers.testResult({ name: 'example test', status: TestStatus.Failed, failureMessages: ['expected error'] }),
          producers.testResult({ name: '2nd example test', status: TestStatus.Failed })
        ];
      });

      it('should have logged the errors', async () => {
        await expect(sut.run()).rejected;
        expect(log.error).calledWith(`One or more tests failed in the initial test run:${EOL}\texample test${EOL}\t\texpected error${EOL}\t2nd example test`);
      });
      it('should reject with correct message', async () => {
        await expect(sut.run()).rejectedWith('There were failed tests in the initial test run.');
      });
    });

    describe('and run has some errors', () => {

      beforeEach(() => {
        expectedRunResult.status = RunStatus.Error;
        expectedRunResult.errorMessages = ['foobar', 'example'];
      });

      it('should have logged the errors', async () => {
        await expect(sut.run()).rejected;
        expect(log.error).calledWith(`One or more tests resulted in an error:${EOL}\tfoobar${EOL}\texample`);
      });
      it('should reject with correct message', async () => {
        await expect(sut.run()).rejectedWith('Something went wrong in the initial test run');
      });
    });

    describe('and run timed out', () => {
      beforeEach(() => {
        expectedRunResult.status = RunStatus.Timeout;
        expectedRunResult.tests = [
          producers.testResult({ name: 'foobar test' }),
          producers.testResult({ name: 'example test', status: TestStatus.Failed })];
      });

      it('should have logged the timeout', async () => {
        await expect(sut.run()).rejected;
        expect(log.error).calledWith(`Initial test run timed out! Ran following tests before timeout:${EOL}\tfoobar test (Success)${EOL}\texample test (Failed)`);
      });

      it('should reject with correct message', async () => {
        await expect(sut.run()).rejectedWith('Something went wrong in the initial test run');
      });
    });
  });
});
