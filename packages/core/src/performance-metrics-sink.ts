interface WorkerStats {
  mutantsHandled: number;
  busyWallMs: number;
  idleWallMs: number;
}

export interface WorkerActivity {
  id: string;
  mutantsHandled: number;
  busyWallMs: number;
  idleWallMs: number;
}

/**
 * Collects performance metrics that originate deep inside the test runner decorator chain
 * and the concurrency pool, where the mutation test executor has no direct reference.
 * A single instance is shared (via DI) by every decorator and pool resource, so the
 * executor can read the aggregated numbers when building the experimental performance report.
 * All recording is a no-op unless `enabled`, keeping the default run free of overhead.
 */
export class PerformanceMetricsSink {
  private readonly reloadMsByMutantId = new Map<string, number>();
  private readonly reloadedMutantIds = new Set<string>();
  private readonly workerStatsById = new Map<string, WorkerStats>();
  private retryCount = 0;
  private oomRestartCount = 0;
  private mutationPhaseStarted = false;

  constructor(private readonly enabled: boolean) {}

  public beginMutationPhase(): void {
    this.mutationPhaseStarted = true;
  }

  public recordReload(mutantId: string, elapsedMs: number): void {
    if (!this.enabled) {
      return;
    }
    this.reloadedMutantIds.add(mutantId);
    this.reloadMsByMutantId.set(
      mutantId,
      (this.reloadMsByMutantId.get(mutantId) ?? 0) + elapsedMs,
    );
  }

  public didReload(mutantId: string): boolean {
    return this.reloadedMutantIds.has(mutantId);
  }

  public reloadMsFor(mutantId: string): number {
    return this.reloadMsByMutantId.get(mutantId) ?? 0;
  }

  public get totalReloads(): number {
    return this.reloadedMutantIds.size;
  }

  public get totalReloadWallMs(): number {
    let total = 0;
    for (const ms of this.reloadMsByMutantId.values()) {
      total += ms;
    }
    return total;
  }

  public recordRetry(): void {
    if (this.enabled) {
      this.retryCount++;
    }
  }

  public recordOomRestart(): void {
    if (this.enabled) {
      this.oomRestartCount++;
    }
  }

  public get retries(): number {
    return this.retryCount;
  }

  public get oomRestarts(): number {
    return this.oomRestartCount;
  }

  public recordWorkerActivity(
    workerId: string,
    busyWallMs: number,
    idleWallMs: number,
  ): void {
    if (!this.enabled || !this.mutationPhaseStarted) {
      return;
    }
    const stats = this.workerStatsById.get(workerId) ?? {
      mutantsHandled: 0,
      busyWallMs: 0,
      idleWallMs: 0,
    };
    stats.mutantsHandled++;
    stats.busyWallMs += busyWallMs;
    stats.idleWallMs += idleWallMs;
    this.workerStatsById.set(workerId, stats);
  }

  public workers(): WorkerActivity[] {
    return [...this.workerStatsById.entries()].map(([id, stats]) => ({
      id,
      ...stats,
    }));
  }
}
