import { expect } from 'chai';
import * as _ from 'lodash';
import { empty, of } from 'rxjs';
import { Config } from 'stryker-api/config';
import { File, LogLevel } from 'stryker-api/core';
import { MutantStatus } from 'stryker-api/report';
import { TestFramework } from 'stryker-api/test_framework';
import { RunStatus, TestStatus } from 'stryker-api/test_runner';
import { Logger } from 'stryker-api/logging';
import Sandbox from '../../../src/Sandbox';
import SandboxPool, * as sandboxPool from '../../../src/SandboxPool';
import TestableMutant from '../../../src/TestableMutant';
import TranspiledMutant from '../../../src/TranspiledMutant';
import MutantTestExecutor from '../../../src/process/MutationTestExecutor';
import BroadcastReporter from '../../../src/reporters/BroadcastReporter';
import MutantTranspiler, * as mutantTranspiler from '../../../src/transpiler/MutantTranspiler';
import { Mock, config, file, mock, mutantResult, testFramework, testResult, testableMutant, transpiledMutant, runResult } from '../../helpers/producers';
import LoggingClientContext from '../../../src/logging/LoggingClientContext';
import currentLogMock from '../../helpers/logMock';
import * as sinon from 'sinon';

const createTranspiledMutants = (...n: number[]) => {
  return n.map(n => {
    const mutant = transpiledMutant(`mutant_${n}`);
    if (n) {
      mutant.mutant.selectTest(testResult(), n);
    }
    return mutant;
  });
};

const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({
  level: LogLevel.Fatal,
  port: 4200
});

describe('MutationTestExecutor', () => {

  let sandboxPoolMock: Mock<SandboxPool>;
  let mutantTranspilerMock: Mock<MutantTranspiler>;
  let testFrameworkMock: TestFramework;
  let transpiledMutants: TranspiledMutant[];
  let inputFiles: File[];
  let reporter: Mock<BroadcastReporter>;
  let expectedConfig: Config;
  let sut: MutantTestExecutor;
  let mutants: TestableMutant[];
  let initialTranspiledFiles: File[];
  let logMock: Mock<Logger>;

  beforeEach(() => {
    logMock = currentLogMock();
    sandboxPoolMock = mock(SandboxPool);
    mutantTranspilerMock = mock(MutantTranspiler);
    initialTranspiledFiles = [file(), file()];
    mutantTranspilerMock.initialize.resolves(initialTranspiledFiles);
    sandboxPoolMock.disposeAll.resolves();
    testFrameworkMock = testFramework();
    sinon.stub(sandboxPool, 'default').returns(sandboxPoolMock);
    sinon.stub(mutantTranspiler, 'default').returns(mutantTranspilerMock);
    reporter = mock(BroadcastReporter);
    inputFiles = [new File('input.ts', '')];
    expectedConfig = config();
    mutants = [testableMutant()];
  });

  describe('run', () => {

    beforeEach(async () => {
      sut = new MutantTestExecutor(expectedConfig, inputFiles, testFrameworkMock, reporter, 42, LOGGING_CONTEXT);
      const sandbox = mock<Sandbox>(Sandbox as any);
      sandbox.runMutant.resolves(mutantResult());
      sandboxPoolMock.streamSandboxes.returns(of(sandbox));
      mutantTranspilerMock.transpileMutants.returns(empty());
      await sut.run(mutants);
    });

    it('should create the mutant transpiler', () => {
      expect(mutantTranspiler.default).calledWith(expectedConfig);
      expect(mutantTranspiler.default).calledWithNew;
    });
    it('should create the sandbox pool', () => {
      expect(sandboxPool.default).calledWith(expectedConfig, testFrameworkMock, initialTranspiledFiles, 42);
      expect(sandboxPool.default).calledWithNew;
    });

    it('should initialize the mutantTranspiler', () => {
      expect(mutantTranspilerMock.initialize).calledWith(inputFiles);
    });

    it('should dispose all sandboxes afterwards', () => {
      expect(sandboxPoolMock.disposeAll).called;
    });
  });

  describe('run with 2 sandboxes and 6 transpiled mutants', () => {
    let firstSandbox: Mock<Sandbox>;
    let secondSandbox: Mock<Sandbox>;

    beforeEach(() => {
      transpiledMutants = createTranspiledMutants(0, 1, 2, 3, 4, 5, 6);
      transpiledMutants[1].transpileResult.error = 'Error! Cannot negate a string (or something)';
      transpiledMutants[6].changedAnyTranspiledFiles = false;

      firstSandbox = mock(Sandbox as any);
      secondSandbox = mock(Sandbox as any);
      mutantTranspilerMock.transpileMutants.returns(of(...transpiledMutants));
      sandboxPoolMock.streamSandboxes.returns(of(firstSandbox, secondSandbox));

      sut = new MutantTestExecutor(config(), inputFiles, testFrameworkMock, reporter, 42, LOGGING_CONTEXT);

      // The uncovered, transpile error and changedAnyTranspiledFiles = false should not be ran in a sandbox
      // Mock first sandbox to return first success, then failed
      firstSandbox.runMutant
        .withArgs(transpiledMutants[2]).resolves({ status: RunStatus.Complete, tests: [{ name: 'test1', status: TestStatus.Success }, { name: 'skipped', status: TestStatus.Skipped }] })
        .withArgs(transpiledMutants[4]).resolves({ status: RunStatus.Complete, tests: [{ name: 'test2', status: TestStatus.Failed }] });

      // Mock second sandbox to return first timeout, then error
      secondSandbox.runMutant
        .withArgs(transpiledMutants[3]).resolves({ status: RunStatus.Timeout, tests: [{ name: 'test3', status: TestStatus.Skipped }] })
        .withArgs(transpiledMutants[5]).resolves(runResult({
          errorMessages: ['foo', 'bar'],
          status: RunStatus.Error,
          tests: [testResult({ name: 'test4', status: TestStatus.Skipped })]
        }));
    });

    it('should have ran 2 mutants on the first and second sandbox', async () => {
      await sut.run(mutants);
      expect(firstSandbox.runMutant).to.have.been.calledTwice;
      expect(secondSandbox.runMutant).to.have.been.calledTwice;
    });

    it('should have reported onMutantTested on all mutants', async () => {
      const actualResults = await sut.run(mutants);
      expect(reporter.onMutantTested).to.have.callCount(7);
      expect(reporter.onMutantTested).to.have.been.calledWith(actualResults[0]);
      expect(reporter.onMutantTested).to.have.been.calledWith(actualResults[1]);
      expect(reporter.onMutantTested).to.have.been.calledWith(actualResults[2]);
      expect(reporter.onMutantTested).to.have.been.calledWith(actualResults[3]);
      expect(reporter.onMutantTested).to.have.been.calledWith(actualResults[4]);
      expect(reporter.onMutantTested).to.have.been.calledWith(actualResults[5]);
      expect(reporter.onMutantTested).to.have.been.calledWith(actualResults[6]);
    });

    it('should have reported onAllMutantsTested', async () => {
      const actualResults = await sut.run(mutants);
      expect(reporter.onAllMutantsTested).to.have.been.calledWith(actualResults);
    });

    it('should eventually resolve the correct mutant results', async () => {
      const actualResults = await sut.run(mutants);
      const actualResultsSorted = _.sortBy(actualResults, r => r.sourceFilePath);
      expect(actualResults.length).to.be.eq(7);
      expect(actualResultsSorted[0].status).to.be.eq(MutantStatus.NoCoverage);
      expect(actualResultsSorted[1].status).to.be.eq(MutantStatus.TranspileError);
      expect(actualResultsSorted[2].status).to.be.eq(MutantStatus.Survived);
      expect(actualResultsSorted[3].status).to.be.eq(MutantStatus.TimedOut);
      expect(actualResultsSorted[4].status).to.be.eq(MutantStatus.Killed);
      expect(actualResultsSorted[5].status).to.be.eq(MutantStatus.RuntimeError);
      expect(actualResultsSorted[6].status).to.be.eq(MutantStatus.Survived);
    });

    it('should log error results on debug', async () => {
      logMock.isDebugEnabled.returns(true);
      await sut.run(mutants);
      expect(logMock.debug).calledWith('A runtime error occurred: %s during execution of mutant: %s',
        ['foo', 'bar'].toString(), transpiledMutants[5].mutant.toString());
    });

    it('should log transpile error results on debug', async () => {
      logMock.isDebugEnabled.returns(true);
      await sut.run(mutants);
      expect(logMock.debug).calledWith(`Transpile error occurred: "Error! Cannot negate a string (or something)" during transpiling of mutant ${
        transpiledMutants[1].mutant.toString()}`);
    });
  });
});
