import { Observable, Subject, merge } from 'rxjs';
import { flatMap, filter, shareReplay } from 'rxjs/operators';
import { notEmpty } from '@stryker-mutator/util';
import { Disposable, tokens } from 'typed-inject';
import { TestRunner } from '@stryker-mutator/api/test_runner';
import { Checker } from '@stryker-mutator/api/check';

import { coreTokens } from '../di';

const MAX_CONCURRENT_INIT = 2;

export interface Worker {
  init?(): Promise<unknown>;
  dispose?(): Promise<unknown>;
}

createTestRunnerPool.inject = tokens(coreTokens.testRunnerFactory, coreTokens.testRunnerConcurrencyTokens);
export function createTestRunnerPool(factory: () => TestRunner, concurrencyToken$: Observable<number>): Pool<TestRunner> {
  return new Pool(factory, concurrencyToken$);
}

createCheckerPool.inject = tokens(coreTokens.checkerFactory, coreTokens.checkerConcurrencyTokens);
export function createCheckerPool(factory: () => Checker, concurrencyToken$: Observable<number>): Pool<Checker> {
  return new Pool(factory, concurrencyToken$);
}

/**
 * Represents a pool of workers.
 * Creates as many workers as the concurrency tokens allow.
 * Also takes care of the initialing of the workers (with `init()`)
 * Re-emit a worker via `recycle`.
 *
 * Please recycle! 🚮
 */
export class Pool<T extends Worker> implements Disposable {
  private readonly recycleBin = new Subject<T>();
  private readonly allWorkers: T[] = [];
  public readonly worker$: Observable<T>;
  private readonly createdWorker$: Observable<T>;

  constructor(factory: () => T, concurrencyToken$: Observable<number>) {
    this.createdWorker$ = concurrencyToken$.pipe(
      flatMap(async () => {
        if (this.isDisposed) {
          return null;
        } else {
          const worker = factory();
          this.allWorkers.push(worker);
          await worker.init?.();
          return worker;
        }
      }, MAX_CONCURRENT_INIT),
      filter(notEmpty),
      // We use share replay here. This way the dry run can use a test runner that is later reused during mutation testing
      // https://www.learnrxjs.io/learn-rxjs/operators/multicasting/sharereplay
      shareReplay()
    );
    this.worker$ = merge(this.recycleBin, this.createdWorker$);
  }

  /**
   * Returns a promise that resolves if all concurrency tokens have resulted in initialized workers.
   * This is optional, workers will get initialized either way.
   */
  public async init(): Promise<void> {
    await this.createdWorker$.toPromise();
  }

  /**
   * Recycles a worker so its re-emitted from the `worker$` observable.
   * @param worker The worker to recycle
   */
  public recycle(worker: T) {
    this.recycleBin.next(worker);
  }

  private isDisposed = false;

  /**
   * Dispose the pool
   */
  public async dispose(): Promise<void> {
    this.isDisposed = true;
    this.recycleBin.complete();
    await Promise.all(this.allWorkers.map((worker) => worker.dispose?.()));
  }
}
