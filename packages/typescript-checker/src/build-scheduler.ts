/**
 * Backs the timer surface of the TypeScript solution-builder-watch host.
 *
 * The solution builder spreads its multi-project rebuild across debounced
 * `setTimeout` ticks. Relying on those timers firing on the ambient event loop
 * makes compile-error detection depend on scheduling: under load a build-status
 * summary from one cycle can resolve a check before the mutated project has been
 * type-checked, so a genuine compile error is missed.
 *
 * Instead of firing autonomously, this scheduler collects the builder's pending
 * work and lets the caller run it to completion synchronously via
 * {@link BuildScheduler.drainToIdle}. Completion then means "no work is left",
 * independent of the event loop.
 */
export class BuildScheduler {
  private nextHandle = 0;
  private readonly pendingBuilds = new Map<number, () => void>();

  public readonly schedule = (
    callback: (...args: unknown[]) => void,
    _delayMs: number,
    ...args: unknown[]
  ): number => {
    const handle = this.nextHandle++;
    this.pendingBuilds.set(handle, () => callback(...args));
    return handle;
  };

  public readonly cancel = (handle: number): void => {
    this.pendingBuilds.delete(handle);
  };

  public get isIdle(): boolean {
    return this.pendingBuilds.size === 0;
  }

  /**
   * Runs pending builder work until nothing is left. A running build can emit
   * declaration files that re-enter the watcher and enqueue follow-up work; the
   * loop keeps draining those too. Invalidations only ever flow downstream
   * through the project-reference graph, so the queue is guaranteed to empty.
   */
  public drainToIdle(): void {
    let iterations = 0;
    while (this.pendingBuilds.size) {
      if (iterations++ > MAX_DRAIN_ITERATIONS) {
        throw new Error(
          'The TypeScript solution builder never reached an idle state. Please open an issue on the stryker-js github.',
        );
      }
      const [handle, runBuild] = this.pendingBuilds.entries().next().value!;
      this.pendingBuilds.delete(handle);
      runBuild();
    }
  }
}

const MAX_DRAIN_ITERATIONS = 100_000;
