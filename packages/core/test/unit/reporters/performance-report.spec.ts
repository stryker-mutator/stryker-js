import { expect } from 'chai';
import { factory } from '@stryker-mutator/test-helpers';

import {
  buildPerformanceReport,
  collectConfig,
  EnvironmentInfo,
  MutantPerformance,
  PerformancePhases,
  PerformanceReportInput,
} from '../../../src/reporters/performance-report.js';

const environment: EnvironmentInfo = {
  os: { platform: 'linux', release: '1', arch: 'x64' },
  cpu: { cores: 8, model: 'test', speedMHz: 2400 },
  memory: { totalBytes: 100, freeBytesAtStart: 50 },
  node: 'v20.0.0',
  ci: false,
};

const phases: PerformancePhases = {
  setup: 900,
  initialRun: 1500,
  initialRunNet: 1200,
  initialRunOverhead: 300,
  mutation: 5000,
  check: 400,
  testRun: 4600,
  reporting: 120,
};

function mutantPerformance(
  overrides: Partial<MutantPerformance> = {},
): MutantPerformance {
  return {
    id: '1',
    mutatorName: 'BooleanLiteral',
    fileName: 'src/foo.ts',
    status: 'Killed',
    static: false,
    reloaded: false,
    workerId: undefined,
    selectedTests: 3,
    coveredBy: 3,
    testsCompleted: 1,
    wallMs: 100,
    reloadWallMs: 0,
    ...overrides,
  };
}

function input(
  overrides: Partial<PerformanceReportInput> = {},
): PerformanceReportInput {
  return {
    strykerVersion: '1.0.0',
    startedAt: '2020-01-01T00:00:00.000Z',
    finishedAt: '2020-01-01T00:00:10.000Z',
    totalWallMs: 10_000,
    environment,
    config: collectConfig(factory.strykerOptions(), {
      checkers: 0,
      testRunners: 4,
    }),
    context: { mutants: 4, mutantsRun: 0, tests: 10, testFiles: 2 },
    phases,
    plans: [],
    results: [],
    mutants: [],
    workers: [],
    reloadCount: 0,
    reloadWallMs: 0,
    retries: 0,
    oomRestarts: 0,
    ...overrides,
  };
}

describe(buildPerformanceReport.name, () => {
  it('should count plans by kind', () => {
    const plans = [
      factory.mutantEarlyResultPlan(),
      factory.mutantRunPlan({
        runOptions: factory.mutantRunOptions({ testFilter: [] }),
      }),
      factory.mutantRunPlan({
        mutant: factory.mutantTestCoverage({ static: true }),
        runOptions: factory.mutantRunOptions({ testFilter: ['a'] }),
      }),
      factory.mutantRunPlan({
        mutant: factory.mutantTestCoverage({ static: false }),
        runOptions: factory.mutantRunOptions({ testFilter: ['a'] }),
      }),
    ];

    const report = buildPerformanceReport(input({ plans }));

    expect(report.totals.byPlanKind).deep.equal({
      earlyResult: 1,
      noCoverage: 1,
      static: 1,
      runtime: 1,
    });
  });

  it('should count results by status', () => {
    const results = [
      factory.mutantResult({ status: 'Killed' }),
      factory.mutantResult({ status: 'Killed' }),
      factory.mutantResult({ status: 'Survived' }),
    ];

    const report = buildPerformanceReport(input({ results }));

    expect(report.totals.byStatus).deep.equal({ Killed: 2, Survived: 1 });
  });

  it('should split wall time and reloads between static and runtime mutants', () => {
    const mutants = [
      mutantPerformance({
        id: '1',
        static: true,
        reloaded: true,
        wallMs: 300,
        reloadWallMs: 120,
      }),
      mutantPerformance({
        id: '2',
        static: true,
        reloaded: true,
        wallMs: 100,
        reloadWallMs: 40,
      }),
      mutantPerformance({ id: '3', static: false, wallMs: 100 }),
    ];

    const report = buildPerformanceReport(input({ mutants }));

    expect(report.totals.static).deep.equal({
      count: 2,
      wallMs: 400,
      reloads: 2,
      reloadWallMs: 160,
    });
    expect(report.totals.runtime).deep.equal({ count: 1, wallMs: 100 });
  });

  it('should compute the static shares of wall time and count', () => {
    const mutants = [
      mutantPerformance({ id: '1', static: true, wallMs: 300 }),
      mutantPerformance({ id: '2', static: false, wallMs: 100 }),
    ];

    const report = buildPerformanceReport(input({ mutants }));

    expect(report.totals.staticShareOfMutantWallMs).equal(0.75);
    expect(report.totals.staticShareOfCount).equal(0.5);
  });

  it('should carry the all-reloads totals (static plus post-static runtime reloads)', () => {
    const report = buildPerformanceReport(
      input({ reloadCount: 808, reloadWallMs: 744714 }),
    );

    expect(report.totals.reload).deep.equal({ count: 808, wallMs: 744714 });
  });

  it('should report zero static shares when no mutants ran', () => {
    const report = buildPerformanceReport(input({ mutants: [] }));

    expect(report.totals.staticShareOfMutantWallMs).equal(0);
    expect(report.totals.staticShareOfCount).equal(0);
  });

  it('should pass phases, environment and context through', () => {
    const report = buildPerformanceReport(input());

    expect(report.phases).deep.equal(phases);
    expect(report.environment).deep.equal(environment);
    expect(report.context).deep.equal({
      mutants: 4,
      mutantsRun: 0,
      tests: 10,
      testFiles: 2,
    });
  });
});

describe(collectConfig.name, () => {
  it('should sum the concurrency split into effective concurrency', () => {
    const config = collectConfig(
      factory.strykerOptions({ testRunner: 'vitest' }),
      {
        checkers: 2,
        testRunners: 3,
      },
    );

    expect(config.concurrency).equal(5);
    expect(config.concurrencySplit).deep.equal({ checkers: 2, testRunners: 3 });
    expect(config.testRunner).equal('vitest');
  });
});
