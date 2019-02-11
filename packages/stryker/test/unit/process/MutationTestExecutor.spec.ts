import { expect } from 'chai';
import * as _ from 'lodash';
import { EMPTY } from 'rxjs';
import * as sinon from 'sinon';
import { File } from 'stryker-api/core';
import { MutantStatus } from 'stryker-api/report';
import { RunStatus, TestStatus } from 'stryker-api/test_runner';
import Sandbox from '../../../src/Sandbox';
import { SandboxPool } from '../../../src/SandboxPool';
import TestableMutant from '../../../src/TestableMutant';
import TranspiledMutant from '../../../src/TranspiledMutant';
import { MutationTestExecutor } from '../../../src/process/MutationTestExecutor';
import BroadcastReporter from '../../../src/reporters/BroadcastReporter';
import { MutantTranspileScheduler } from '../../../src/transpiler/MutantTranspileScheduler';
import { Mock, mock, mutantResult, testResult, testableMutant, transpiledMutant, runResult } from '../../helpers/producers';
import { testInjector } from '@stryker-mutator/test-helpers';
import { coreTokens } from '../../../src/di';
import InputFileCollection from '../../../src/input/InputFileCollection';
import { from } from 'rxjs';

const createTranspiledMutants = (...n: number[]) => {
  return n.map(n => {
    const mutant = transpiledMutant(`mutant_${n}`);
    if (n) {
      mutant.mutant.selectTest(testResult(), n);
    }
    return mutant;
  });
};

describe(MutationTestExecutor.name, () => {

  let sandboxPoolMock: Mock<SandboxPool>;
  let mutantTranspileSchedulerMock: Mock<MutantTranspileScheduler>;
  let transpiledMutants: TranspiledMutant[];
  let inputFiles: InputFileCollection;
  let reporter: Mock<BroadcastReporter>;
  let sut: MutationTestExecutor;
  let mutants: TestableMutant[];

  beforeEach(() => {
    sandboxPoolMock = mock(SandboxPool);
    mutantTranspileSchedulerMock = mock(MutantTranspileScheduler);
    mutantTranspileSchedulerMock.scheduleNext = sinon.stub();
    sandboxPoolMock.disposeAll.resolves();
    reporter = mock(BroadcastReporter);
    inputFiles = new InputFileCollection([new File('input.ts', '')], []);
    mutants = [testableMutant()];
  });

  function createSut(): MutationTestExecutor {
    return testInjector.injector
      .provideValue(coreTokens.sandboxPool, sandboxPoolMock as unknown as SandboxPool)
      .provideValue(coreTokens.mutantTranspileScheduler, mutantTranspileSchedulerMock as unknown as MutantTranspileScheduler)
      .provideValue(coreTokens.inputFiles, inputFiles)
      .provideValue(coreTokens.reporter, reporter)
      .injectClass(MutationTestExecutor);
  }

  describe('run', () => {

    beforeEach(async () => {
      sut = createSut();
      const sandbox = mock<Sandbox>(Sandbox as any);
      sandbox.runMutant.resolves(mutantResult());
      mutantTranspileSchedulerMock.scheduleTranspileMutants.returns(EMPTY);
      await sut.run(mutants);
    });

    it('should dispose all sandboxes afterwards', () => {
      expect(sandboxPoolMock.disposeAll).called;
    });

    it('should dispose the mutantTranspiler', () => {
      expect(mutantTranspileSchedulerMock.dispose).called;
    });
  });

  describe('run with 7 transpiled mutants', () => {

    beforeEach(() => {
      transpiledMutants = createTranspiledMutants(0, 1, 2, 3, 4, 5, 6);
      transpiledMutants[1].transpileResult.error = 'Error! Cannot negate a string (or something)';
      transpiledMutants[6].changedAnyTranspiledFiles = false;

      mutantTranspileSchedulerMock.scheduleTranspileMutants.returns(from(transpiledMutants));

      sut = createSut();

      // The uncovered, transpile error and changedAnyTranspiledFiles = false should not be run in a sandbox
      sandboxPoolMock.run
        .withArgs(transpiledMutants[2]).resolves({ status: RunStatus.Complete, tests: [{ name: 'test1', status: TestStatus.Success }, { name: 'skipped', status: TestStatus.Skipped }] })
        .withArgs(transpiledMutants[4]).resolves({ status: RunStatus.Complete, tests: [{ name: 'test2', status: TestStatus.Failed }] })
        .withArgs(transpiledMutants[3]).resolves({ status: RunStatus.Timeout, tests: [{ name: 'test3', status: TestStatus.Skipped }] })
        .withArgs(transpiledMutants[5]).resolves(runResult({
          errorMessages: ['foo', 'bar'],
          status: RunStatus.Error,
          tests: [testResult({ name: 'test4', status: TestStatus.Skipped })]
        }));
    });

    it('should have ran 4 mutants in the sandbox pool', async () => {
      await sut.run(mutants);
      expect(sandboxPoolMock.run).callCount(4);
    });

    it('should schedule next mutants to be transpiled', async () => {
      await sut.run(mutants);
      expect(mutantTranspileSchedulerMock.scheduleNext).callCount(7);
    });

    it('should have reported `onMutantTested` on all mutants', async () => {
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

    it('should have reported `onAllMutantsTested`', async () => {
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
      testInjector.logger.isDebugEnabled.returns(true);
      await sut.run(mutants);
      expect(testInjector.logger.debug).calledWith('A runtime error occurred: %s during execution of mutant: %s',
        ['foo', 'bar'].toString(), transpiledMutants[5].mutant.toString());
    });

    it('should log transpile error results on debug', async () => {
      testInjector.logger.isDebugEnabled.returns(true);
      await sut.run(mutants);
      expect(testInjector.logger.debug).calledWith(`Transpile error occurred: "Error! Cannot negate a string (or something)" during transpiling of mutant ${
        transpiledMutants[1].mutant.toString()}`);
    });
  });
});
