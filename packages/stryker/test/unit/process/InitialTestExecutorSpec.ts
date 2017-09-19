import { EOL } from 'os';
import { expect } from 'chai';
import * as strykerSandbox from '../../../src/Sandbox';
import { default as StrykerSandbox } from '../../../src/Sandbox';
import InitialTestExecutor, { InitialTestRunResult } from '../../../src/process/InitialTestExecutor';
import { File } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import * as producers from '../../helpers/producers';
import { TestFramework } from 'stryker-api/test_framework';
import CoverageInstrumenter from '../../../src/coverage/CoverageInstrumenter';
import TranspilerFacade, * as transpilerFacade from '../../../src/transpiler/TranspilerFacade';
import { TranspileResult } from 'stryker-api/transpile';
import { RunStatus, RunResult, TestStatus } from 'stryker-api/test_runner';
import log from '../../helpers/log4jsMock';
import Timer from '../../../src/utils/Timer';

describe('InitialTestExecutor run', () => {

  let strykerSandboxMock: producers.Mock<StrykerSandbox>;
  let sut: InitialTestExecutor;
  let testFrameworkMock: TestFramework;
  let coverageInstrumenter: CoverageInstrumenter;
  let options: Config;
  let transpilerFacadeMock: producers.Mock<TranspilerFacade>;
  let transpileResultMock: TranspileResult;
  let timer: producers.Mock<Timer>;
  let expectedRunResult: RunResult;

  beforeEach(() => {
    strykerSandboxMock = producers.mock(StrykerSandbox);
    transpilerFacadeMock = producers.mock(TranspilerFacade);
    sandbox.stub(strykerSandbox, 'default').returns(strykerSandboxMock);
    sandbox.stub(transpilerFacade, 'default').returns(transpilerFacadeMock);
    testFrameworkMock = producers.testFramework();
    coverageInstrumenter = new CoverageInstrumenter('off', testFrameworkMock);
    transpileResultMock = producers.transpileResult({
      outputFiles: [
        producers.textFile({ name: 'transpiled-file-1.js' }),
        producers.textFile({ name: 'transpiled-file-2.js' })
      ]
    });
    transpilerFacadeMock.transpile.returns(transpileResultMock);
    options = producers.config();
    expectedRunResult = producers.runResult();
    strykerSandboxMock.run.resolves(expectedRunResult);
    timer = producers.mock(Timer);
  });

  describe('without input files', () => {
    it('should log a warning and cancel the test run', async () => {
      sut = new InitialTestExecutor(options, [], coverageInstrumenter, testFrameworkMock, timer as any);
      const result = await sut.run();
      expect(result.runResult.status).to.be.eq(RunStatus.Complete);
      expect(log.info).to.have.been.calledWith('No files have been found. Aborting initial test run.');
    });
  });

  describe('with input files', () => {

    let files: File[];

    beforeEach(() => {
      files = [producers.textFile({ name: '', mutated: true, included: true, content: '' })];
      sut = new InitialTestExecutor(options, files, coverageInstrumenter, testFrameworkMock, timer as any);
    });

    it('should create a sandbox with correct arguments', async () => {
      await sut.run();
      expect(strykerSandbox.default).calledWith(options, 0, transpileResultMock.outputFiles, testFrameworkMock, coverageInstrumenter);
      expect(strykerSandbox.default).calledWithNew;
    });

    it('should initialize, run and dispose the sandbox', async () => {
      await sut.run();
      expect(strykerSandboxMock.initialize).to.have.been.called;
      expect(strykerSandboxMock.run).to.have.been.calledWith(60 * 1000 * 5);
      expect(strykerSandboxMock.dispose).to.have.been.called;
    });

    it('should pass through the result', async () => {
      const expectedResult: InitialTestRunResult = {
        runResult: expectedRunResult,
        transpiledFiles: transpileResultMock.outputFiles
      };
      const actualRunResult = await sut.run();
      expect(actualRunResult).deep.eq(expectedResult);
    });

    it('should log the transpiled results if transpilers are specified and log.debug is enabled', async () => {
      options.transpilers.push('a transpiler');
      log.isDebugEnabled.returns(true);
      await sut.run();
      expect(log.debug).calledOnce;
      const actualLogMessage: string = log.debug.getCall(0).args[0];
      expect(actualLogMessage).contains('Transpiled files in order');
      expect(actualLogMessage).contains('transpiled-file-1.js (included: true)');
      expect(actualLogMessage).contains('transpiled-file-2.js (included: true)');
    });

    it('should not log the transpiled results if transpilers are not specified', async () => {
      log.isDebugEnabled.returns(true);
      await sut.run();
      expect(log.debug).not.called;
    });

    it('should not log the transpiled results if log.debug is disabled', async () => {
      options.transpilers.push('a transpiler');
      log.isDebugEnabled.returns(false);
      await sut.run();
      expect(log.debug).not.called;
    });

    it('should have logged the amount of tests ran', async () => {
      expectedRunResult.tests.push(producers.testResult());
      await sut.run();
      expect(log.info).to.have.been.calledWith('Initial test run succeeded. Ran %s tests in %s.', 2);
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

