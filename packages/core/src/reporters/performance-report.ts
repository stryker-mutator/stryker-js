import os from 'os';

import {
  MutantStatus,
  MutantTestPlan,
  PlanKind,
  StrykerOptions,
  MutantResult,
} from '@stryker-mutator/api/core';

export interface EnvironmentInfo {
  os: { platform: string; release: string; arch: string };
  cpu: { cores: number; model: string; speedMHz: number };
  memory: { totalBytes: number; freeBytesAtStart: number };
  node: string;
  ci: boolean;
}

export interface ConfigInfo {
  testRunner: string;
  coverageAnalysis: string;
  concurrency: number;
  concurrencySplit: { checkers: number; testRunners: number };
  checkers: string[];
  ignoreStatic: boolean;
  disableBail: boolean;
}

export interface ContextInfo {
  mutants: number;
  mutantsRun: number;
  tests: number;
  testFiles: number;
}

export interface PerformancePhases {
  setup: number;
  initialRun: number;
  initialRunNet: number;
  initialRunOverhead: number;
  mutation: number;
  check: number;
  testRun: number;
  reporting: number;
}

export interface MutantPerformance {
  id: string;
  mutatorName: string;
  fileName: string;
  status: MutantStatus;
  static: boolean;
  reloaded: boolean;
  workerId: string | undefined;
  selectedTests: number;
  coveredBy: number;
  testsCompleted: number;
  wallMs: number;
  reloadWallMs: number;
}

export interface WorkerPerformance {
  id: string;
  mutantsHandled: number;
  busyWallMs: number;
  idleWallMs: number;
}

export interface ActivationTotals {
  count: number;
  wallMs: number;
  reloads: number;
  reloadWallMs: number;
}

export interface PerformanceTotals {
  byPlanKind: {
    earlyResult: number;
    noCoverage: number;
    static: number;
    runtime: number;
  };
  byStatus: Partial<Record<MutantStatus, number>>;
  static: ActivationTotals;
  runtime: Pick<ActivationTotals, 'count' | 'wallMs'>;
  reload: { count: number; wallMs: number };
  staticShareOfMutantWallMs: number;
  staticShareOfCount: number;
  retries: number;
  oomRestarts: number;
}

export interface PerformanceReport {
  strykerVersion: string;
  startedAt: string;
  finishedAt: string;
  totalWallMs: number;
  environment: EnvironmentInfo;
  config: ConfigInfo;
  context: ContextInfo;
  phases: PerformancePhases;
  totals: PerformanceTotals;
  workers: WorkerPerformance[];
  mutants: MutantPerformance[];
}

export interface PerformanceReportInput {
  strykerVersion: string;
  startedAt: string;
  finishedAt: string;
  totalWallMs: number;
  environment: EnvironmentInfo;
  config: ConfigInfo;
  context: ContextInfo;
  phases: PerformancePhases;
  plans: readonly MutantTestPlan[];
  results: readonly MutantResult[];
  mutants: readonly MutantPerformance[];
  workers: readonly WorkerPerformance[];
  reloadCount: number;
  reloadWallMs: number;
  retries: number;
  oomRestarts: number;
}

export function collectEnvironment(): EnvironmentInfo {
  const cpus = os.cpus();
  return {
    os: { platform: os.platform(), release: os.release(), arch: os.arch() },
    cpu: {
      cores: cpus.length,
      model: cpus[0]?.model ?? 'unknown',
      speedMHz: cpus[0]?.speed ?? 0,
    },
    memory: { totalBytes: os.totalmem(), freeBytesAtStart: os.freemem() },
    node: process.version,
    ci: Boolean(process.env.CI),
  };
}

export function collectConfig(
  options: StrykerOptions,
  concurrencySplit: { checkers: number; testRunners: number },
): ConfigInfo {
  return {
    testRunner: options.testRunner,
    coverageAnalysis: options.coverageAnalysis,
    concurrency: concurrencySplit.checkers + concurrencySplit.testRunners,
    concurrencySplit,
    checkers: options.checkers,
    ignoreStatic: options.ignoreStatic,
    disableBail: options.disableBail,
  };
}

export function buildPerformanceReport(
  input: PerformanceReportInput,
): PerformanceReport {
  const byPlanKind = { earlyResult: 0, noCoverage: 0, static: 0, runtime: 0 };
  for (const plan of input.plans) {
    if (plan.plan === PlanKind.EarlyResult) {
      byPlanKind.earlyResult++;
    } else if (plan.runOptions.testFilter?.length === 0) {
      byPlanKind.noCoverage++;
    } else if (plan.mutant.static) {
      byPlanKind.static++;
    } else {
      byPlanKind.runtime++;
    }
  }

  const byStatus: Partial<Record<MutantStatus, number>> = {};
  for (const { status } of input.results) {
    byStatus[status] = (byStatus[status] ?? 0) + 1;
  }

  const staticTotals: ActivationTotals = {
    count: 0,
    wallMs: 0,
    reloads: 0,
    reloadWallMs: 0,
  };
  const runtimeTotals = { count: 0, wallMs: 0 };
  for (const mutant of input.mutants) {
    if (mutant.static) {
      staticTotals.count++;
      staticTotals.wallMs += mutant.wallMs;
      staticTotals.reloadWallMs += mutant.reloadWallMs;
      if (mutant.reloaded) {
        staticTotals.reloads++;
      }
    } else {
      runtimeTotals.count++;
      runtimeTotals.wallMs += mutant.wallMs;
    }
  }

  const totalMutantWallMs = staticTotals.wallMs + runtimeTotals.wallMs;
  const totalActivationCount = staticTotals.count + runtimeTotals.count;

  return {
    strykerVersion: input.strykerVersion,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    totalWallMs: input.totalWallMs,
    environment: input.environment,
    config: input.config,
    context: input.context,
    phases: input.phases,
    totals: {
      byPlanKind,
      byStatus,
      static: staticTotals,
      runtime: runtimeTotals,
      reload: { count: input.reloadCount, wallMs: input.reloadWallMs },
      staticShareOfMutantWallMs:
        totalMutantWallMs > 0 ? staticTotals.wallMs / totalMutantWallMs : 0,
      staticShareOfCount:
        totalActivationCount > 0
          ? staticTotals.count / totalActivationCount
          : 0,
      retries: input.retries,
      oomRestarts: input.oomRestarts,
    },
    workers: [...input.workers],
    mutants: [...input.mutants],
  };
}
