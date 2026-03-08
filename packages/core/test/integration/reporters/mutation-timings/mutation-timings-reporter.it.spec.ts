import fs from 'fs';
import path from 'path';

import { TestStatus } from '@stryker-mutator/api/test-runner';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { MutationTimingsReporter } from '../../../../src/reporters/mutation-timings-reporter.js';
import { fileUtils } from '../../../../src/utils/file-utils.js';

describe('MutationTimingsReporter integration', () => {
  const defaultOutput = path.resolve(
    'reports',
    'mutation',
    'mutant-test-timings.json',
  );
  let originalTimingsEnv: string | undefined;
  let originalTimingsFileEnv: string | undefined;

  beforeEach(async () => {
    originalTimingsEnv = process.env.STRYKER_MUTATION_TEST_TIMINGS;
    originalTimingsFileEnv = process.env.STRYKER_MUTATION_TEST_TIMINGS_FILE;
    delete process.env.STRYKER_MUTATION_TEST_TIMINGS;
    delete process.env.STRYKER_MUTATION_TEST_TIMINGS_FILE;
    await fs.promises.rm('reports', { recursive: true, force: true });
  });

  afterEach(async () => {
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
    await fs.promises.rm('reports', { recursive: true, force: true });
  });

  it('writes deterministic ordered sidecar payload and skips mutants without timings', async () => {
    process.env.STRYKER_MUTATION_TEST_TIMINGS = '1';
    const sut = testInjector.injector.injectClass(MutationTimingsReporter);
    sut.onMutantTested({
      ...factory.survivedMutantResult({ id: 'm-1', fileName: 'src/a.ts' }),
      executedTests: [
        {
          id: 't-1',
          name: 'a should work',
          status: TestStatus.Success,
          timeSpentMs: 5,
          fileName: 'test/a.spec.ts',
        },
      ],
    });
    sut.onMutantTested(
      factory.killedMutantResult({ id: 'm-2', fileName: 'src/b.ts' }),
    );
    sut.onMutantTested({
      ...factory.killedMutantResult({ id: 'm-3', fileName: 'src/c.ts' }),
      executedTests: [
        {
          id: 't-2',
          name: 'c should fail',
          status: TestStatus.Failed,
          timeSpentMs: 13,
          fileName: 'test/c.spec.ts',
        },
      ],
    });

    sut.onMutationTestReportReady();
    await sut.wrapUp();

    expect(await fileUtils.exists(defaultOutput)).true;
    const payload = JSON.parse(
      await fs.promises.readFile(defaultOutput, 'utf8'),
    );
    expect(payload.summary.mutantsWithTimings).eq(2);
    expect(payload.summary.executedTests).eq(2);
    expect(payload.mutants.map((mutant: { id: string }) => mutant.id)).deep.eq([
      'm-1',
      'm-3',
    ]);
  });

  it('does not write sidecar when disabled and no entries were captured', async () => {
    const sut = testInjector.injector.injectClass(MutationTimingsReporter);
    sut.onMutationTestReportReady();
    await sut.wrapUp();

    expect(await fileUtils.exists(defaultOutput)).false;
  });
});
