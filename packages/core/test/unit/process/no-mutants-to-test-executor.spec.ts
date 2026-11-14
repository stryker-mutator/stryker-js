import sinon from 'sinon';
import { expect } from 'chai';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { Reporter } from '@stryker-mutator/api/report';
import { Mutant, MutantResult, PlanKind } from '@stryker-mutator/api/core';

import { NoMutantsToTestExecutor } from '../../../src/process/index.js';
import { coreTokens } from '../../../src/di/index.js';
import { Project } from '../../../src/fs/index.js';
import { IncrementalDiffer, TestCoverage } from '../../../src/mutants/index.js';
import { MutationTestReportHelper } from '../../../src/reporters/mutation-test-report-helper.js';
import { Timer } from '../../../src/utils/timer.js';
import { FileSystemTestDouble } from '../../helpers/file-system-test-double.js';

describe(NoMutantsToTestExecutor.name, () => {
  let mutants: Mutant[];
  let project: Project;
  let testCoverage: TestCoverage;
  let incrementalDifferMock: sinon.SinonStubbedInstance<IncrementalDiffer>;
  let mutationTestReportHelperMock: sinon.SinonStubbedInstance<MutationTestReportHelper>;
  let reporterMock: sinon.SinonStubbedInstance<Required<Reporter>>;
  let timerMock: sinon.SinonStubbedInstance<Timer>;

  beforeEach(() => {
    mutants = [];
    project = new Project(new FileSystemTestDouble({ 'foo.js': '' }), {
      'foo.js': { mutate: [] },
    });
    testCoverage = new TestCoverage(new Map(), new Map(), undefined, new Map());
    incrementalDifferMock = sinon.createStubInstance(IncrementalDiffer);
    mutationTestReportHelperMock = sinon.createStubInstance(
      MutationTestReportHelper,
    );
    mutationTestReportHelperMock.reportMutantStatus.callsFake(
      (mutant, status) =>
        factory.mutantResult({
          id: mutant.id,
          fileName: mutant.fileName,
          status,
        }),
    );
    reporterMock = factory.reporter();
    timerMock = sinon.createStubInstance(Timer);
  });

  function createSut() {
    return testInjector.injector
      .provideValue(coreTokens.mutants, mutants)
      .provideValue(coreTokens.project, project)
      .provideValue(coreTokens.testCoverage, testCoverage)
      .provideValue(coreTokens.incrementalDiffer, incrementalDifferMock)
      .provideValue(
        coreTokens.mutationTestReportHelper,
        mutationTestReportHelperMock,
      )
      .provideValue(coreTokens.reporter, reporterMock)
      .provideValue(coreTokens.timer, timerMock)
      .injectClass(NoMutantsToTestExecutor);
  }

  it('should report an empty mutation test report when there are no mutants', async () => {
    const result = await createSut().execute();
    expect(result).deep.eq([]);
    sinon.assert.calledOnceWithExactly(
      reporterMock.onMutationTestingPlanReady,
      {
        mutantPlans: [],
      },
    );
    sinon.assert.calledOnceWithExactly(
      mutationTestReportHelperMock.reportAll,
      [],
    );
    sinon.assert.calledOnce(reporterMock.wrapUp);
  });

  it('should report ignored mutants as early results', async () => {
    mutants.push(
      factory.mutant({ id: '1', status: 'Ignored', statusReason: 'foo' }),
      factory.mutant({ id: '2', status: 'Ignored', statusReason: 'bar' }),
    );
    const result = await createSut().execute();
    sinon.assert.calledOnceWithExactly(
      reporterMock.onMutationTestingPlanReady,
      {
        mutantPlans: [
          {
            plan: PlanKind.EarlyResult,
            mutant: { ...mutants[0], status: 'Ignored', static: false },
          },
          {
            plan: PlanKind.EarlyResult,
            mutant: { ...mutants[1], status: 'Ignored', static: false },
          },
        ],
      },
    );
    sinon.assert.calledTwice(mutationTestReportHelperMock.reportMutantStatus);
    expect(result.map(({ id, status }) => ({ id, status }))).deep.eq([
      { id: '1', status: 'Ignored' },
      { id: '2', status: 'Ignored' },
    ]);
    sinon.assert.calledOnceWithExactly(
      mutationTestReportHelperMock.reportAll,
      result,
    );
  });

  it('should report the plan before the mutant results and wrap up after reporting all', async () => {
    mutants.push(factory.mutant({ status: 'Ignored' }));
    await createSut().execute();
    sinon.assert.callOrder(
      reporterMock.onMutationTestingPlanReady,
      mutationTestReportHelperMock.reportMutantStatus,
      mutationTestReportHelperMock.reportAll,
      reporterMock.wrapUp,
    );
  });

  it('should carry over results from the incremental report', async () => {
    const incrementalReport =
      factory.mutationTestReportSchemaMutationTestResult();
    project = new Project(
      new FileSystemTestDouble({ 'foo.js': 'foo' }),
      { 'foo.js': { mutate: [] } },
      incrementalReport,
    );
    const carriedOver: MutantResult = factory.mutantResult({
      id: 'foo.js@1:2-3:4\nBlockStatement: {}',
      status: 'Killed',
    });
    incrementalDifferMock.diff.returns([carriedOver]);

    const result = await createSut().execute();

    sinon.assert.calledOnceWithExactly(
      incrementalDifferMock.diff,
      mutants,
      testCoverage,
      incrementalReport,
      sinon.match.instanceOf(Map),
    );
    sinon.assert.calledOnceWithExactly(
      mutationTestReportHelperMock.reportMutantStatus,
      { ...carriedOver, static: false },
      'Killed',
    );
    expect(result).lengthOf(1);
    expect(result[0].status).eq('Killed');
  });

  it('should not diff when there is no incremental report', async () => {
    await createSut().execute();
    sinon.assert.notCalled(incrementalDifferMock.diff);
  });

  it('should log that it is done', async () => {
    timerMock.humanReadableElapsed.returns('2 seconds');
    await createSut().execute();
    sinon.assert.calledWithExactly(
      testInjector.logger.info,
      'Done in %s.',
      '2 seconds',
    );
  });

  it('should reject when a mutant has no status', async () => {
    mutants.push(factory.mutant({ id: '42', fileName: 'foo.js' }));
    await expect(createSut().execute()).rejectedWith(
      'Mutant 42 in foo.js has no status, it cannot be reported without testing it.',
    );
    sinon.assert.notCalled(mutationTestReportHelperMock.reportAll);
  });
});
