import { expect } from 'chai';
import * as _ from 'lodash';
import * as sinon from 'sinon';
import { File } from '@stryker-mutator/api/core';
import { MutantStatus, MutantResult } from '@stryker-mutator/api/report';
import { SandboxPool } from '../../../src/SandboxPool';
import TestableMutant from '../../../src/TestableMutant';
import TranspiledMutant from '../../../src/TranspiledMutant';
import { MutationTestExecutor } from '../../../src/process/MutationTestExecutor';
import BroadcastReporter from '../../../src/reporters/BroadcastReporter';
import { MutantTranspileScheduler } from '../../../src/transpiler/MutantTranspileScheduler';
import { Mock, mock, testableMutant, transpiledMutant } from '../../helpers/producers';
import { TEST_INJECTOR, factory } from '@stryker-mutator/test-helpers';
import { coreTokens } from '../../../src/di';
import InputFileCollection from '../../../src/input/InputFileCollection';
import { from, Observable } from 'rxjs';
import { of } from 'rxjs';

describe(MutationTestExecutor.name, () => {

  let sandboxPoolMock: Mock<SandboxPool>;
  let mutantTranspileSchedulerMock: Mock<MutantTranspileScheduler>;
  let transpiledMutants: Observable<TranspiledMutant>;
  let inputFiles: InputFileCollection;
  let reporter: Mock<BroadcastReporter>;
  let sut: MutationTestExecutor;
  let mutants: TestableMutant[];
  let mutantResults: MutantResult[];

  beforeEach(() => {
    sandboxPoolMock = mock(SandboxPool);
    mutantTranspileSchedulerMock = mock(MutantTranspileScheduler);
    mutantTranspileSchedulerMock.scheduleNext = sinon.stub();
    sandboxPoolMock.dispose.resolves();
    reporter = mock(BroadcastReporter);
    inputFiles = new InputFileCollection([new File('input.ts', '')], []);
    mutants = [testableMutant()];
    transpiledMutants = of(transpiledMutant('foo.js'), transpiledMutant('bar.js'));
    mutantResults = [
      factory.MUTANT_RESULT({ status: MutantStatus.RuntimeError }),
      factory.MUTANT_RESULT({ status: MutantStatus.Survived })
    ];
    mutantTranspileSchedulerMock.scheduleTranspileMutants.returns(transpiledMutants);
    sandboxPoolMock.runMutants.returns(from(mutantResults));
    sut = createSut();
  });

  function createSut(): MutationTestExecutor {
    return TEST_INJECTOR.injector
      .provideValue(coreTokens.SandboxPool, sandboxPoolMock as unknown as SandboxPool)
      .provideValue(coreTokens.MutantTranspileScheduler, mutantTranspileSchedulerMock as unknown as MutantTranspileScheduler)
      .provideValue(coreTokens.InputFiles, inputFiles)
      .provideValue(coreTokens.Reporter, reporter)
      .injectClass(MutationTestExecutor);
  }

  describe('run', () => {

    it('should have ran the mutants in the sandbox pool', async () => {
      await sut.run(mutants);
      expect(mutantTranspileSchedulerMock.scheduleTranspileMutants).calledWith(mutants);
      expect(sandboxPoolMock.runMutants).calledWith(transpiledMutants);
    });

    it('should schedule next mutants to be transpiled', async () => {
      await sut.run(mutants);
      expect(mutantTranspileSchedulerMock.scheduleNext).callCount(2);
    });

    it('should have reported `onMutantTested` on all mutants', async () => {
      await sut.run(mutants);
      expect(reporter.onMutantTested).to.have.callCount(2);
      expect(reporter.onMutantTested).to.have.been.calledWith(mutantResults[0]);
      expect(reporter.onMutantTested).to.have.been.calledWith(mutantResults[1]);
    });

    it('should have reported `onAllMutantsTested`', async () => {
      const actualResults = await sut.run(mutants);
      expect(reporter.onAllMutantsTested).to.have.been.calledWith(actualResults);
    });

    it('should eventually resolve the correct mutant results', async () => {
      const actualResults = await sut.run(mutants);
      expect(actualResults).deep.eq(mutantResults);
    });

  });
});
