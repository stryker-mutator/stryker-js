import path from 'path';

import { MutantResult } from '@stryker-mutator/api/core';
import { TestStatus } from '@stryker-mutator/api/test-runner';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { MutationTimingsReporter } from '../../../src/reporters/mutation-timings-reporter.js';
import { reporterUtil } from '../../../src/reporters/reporter-util.js';

describe(MutationTimingsReporter.name, () => {
  let sut: MutationTimingsReporter;
  let writeFileStub: sinon.SinonStub;
  let originalTimingsEnv: string | undefined;
  let originalTimingsFileEnv: string | undefined;

  beforeEach(() => {
    originalTimingsEnv = process.env.STRYKER_MUTATION_TEST_TIMINGS;
    originalTimingsFileEnv = process.env.STRYKER_MUTATION_TEST_TIMINGS_FILE;
    delete process.env.STRYKER_MUTATION_TEST_TIMINGS;
    delete process.env.STRYKER_MUTATION_TEST_TIMINGS_FILE;
    writeFileStub = sinon.stub(reporterUtil, 'writeFile').resolves();
    sut = testInjector.injector.injectClass(MutationTimingsReporter);
  });

  afterEach(() => {
    if (originalTimingsEnv === undefined) {
      delete process.env.STRYKER_MUTATION_TEST_TIMINGS;
    } else {
      process.env.STRYKER_MUTATION_TEST_TIMINGS = originalTimingsEnv;
    }
    if (originalTimingsFileEnv === undefined) {
      delete process.env.STRYKER_MUTATION_TEST_TIMINGS_FILE;
    } else {
      process.env.STRYKER_MUTATION_TEST_TIMINGS_FILE = originalTimingsFileEnv;
    }
  });

  it('should write a sidecar report with executed test timings', async () => {
    sut.onMutantTested({
      ...factory.killedMutantResult(),
      executedTests: [
        {
          id: 'spec-1',
          name: 'should kill mutant',
          status: TestStatus.Failed,
          timeSpentMs: 8,
          fileName: 'test/foo.spec.ts',
        },
      ],
    } as MutantResult);

    sut.onMutationTestReportReady();
    await sut.wrapUp();

    expect(writeFileStub).calledOnce;
    expect(writeFileStub).calledWithMatch(
      path.resolve('reports/mutation/mutant-test-timings.json'),
      sinon.match((serialized: string) => {
        const payload = JSON.parse(serialized);
        return (
          payload.schemaVersion === '1' &&
          payload.summary.mutantsWithTimings === 1 &&
          payload.summary.executedTests === 1 &&
          payload.mutants[0].executedTests[0].timeSpentMs === 8
        );
      }),
    );
  });

  it('should respect custom output env path', async () => {
    process.env.STRYKER_MUTATION_TEST_TIMINGS = '1';
    process.env.STRYKER_MUTATION_TEST_TIMINGS_FILE =
      '.reports/custom-timings.json';
    sut.onMutantTested({
      ...factory.survivedMutantResult(),
      executedTests: [
        {
          id: 'spec-1',
          name: 'should survive mutant',
          status: TestStatus.Success,
          timeSpentMs: 5,
          fileName: 'test/foo.spec.ts',
        },
      ],
    } as MutantResult);

    sut.onMutationTestReportReady();
    await sut.wrapUp();

    expect(writeFileStub).calledWithMatch(
      path.resolve('.reports/custom-timings.json'),
      sinon.match.string,
    );
  });

  it('should not write a report when timings are disabled and no entries exist', async () => {
    sut.onMutationTestReportReady();
    await sut.wrapUp();

    expect(writeFileStub).not.called;
  });

  it('should not write a report when timings are enabled but no entries exist', async () => {
    process.env.STRYKER_MUTATION_TEST_TIMINGS = '1';

    sut.onMutationTestReportReady();
    await sut.wrapUp();

    expect(writeFileStub).not.called;
  });
});
