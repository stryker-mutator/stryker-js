import { Observable, Subject, merge, zip } from 'rxjs';
import { mergeMap, filter, shareReplay, tap } from 'rxjs/operators';
import { notEmpty } from '@stryker-mutator/util';
import { Disposable, tokens } from 'typed-inject';
import { TestRunner } from '@stryker-mutator/api/test-runner';
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
 * Represents a pool of workers. Use `schedule` to schedule work to be executed on the workers.
 * The pool will automatically recycle the workers, but will make sure only one task is executed
 * on one worker at any one time. Creates as many workers as the concurrency tokens allow.
 * Also takes care of the initialing of the workers (with `init()`)
 */
export class Pool<TWorker extends Worker> implements Disposable {
  private readonly createdWorkers: TWorker[] = [];
  private readonly worker$: Observable<TWorker>;

  constructor(factory: () => TWorker, concurrencyToken$: Observable<number>) {
    this.worker$ = concurrencyToken$.pipe(
      mergeMap(async () => {
        if (this.isDisposed) {
          return null;
        } else {
          const worker = factory();
          this.createdWorkers.push(worker);
          await worker.init?.();
          return worker;
        }
      }, MAX_CONCURRENT_INIT),
      filter(notEmpty),
      // We use share replay here. This way the dry run can use a test runner that is later reused during mutation testing
      // https://www.learnrxjs.io/learn-rxjs/operators/multicasting/sharereplay
      shareReplay()
    );
  }

  /**
   * Returns a promise that resolves if all concurrency tokens have resulted in initialized workers.
   * This is optional, workers will get initialized either way.
   */
  public async init(): Promise<void> {
    await this.worker$.toPromise();
  }

  /**
   * Schedules a task to be executed on workers in the pool. Each input is paired with a worker, which allows async work to be done.
   * @param input$ The inputs to pair up with a worker.
   * @param task The task to execute on each worker
   */
  public schedule<TIn, TOut>(input$: Observable<TIn>, task: (worker: TWorker, input: TIn) => Promise<TOut> | TOut): Observable<TOut> {
    const recycleBin = new Subject<TWorker>();
    const worker$ = merge(recycleBin, this.worker$);

    return zip(worker$, input$).pipe(
      mergeMap(async ([worker, input]) => {
        const output = await task(worker, input);
        //  Recycles a worker so its re-emitted from the `worker$` observable.
        recycleBin.next(worker);
        return output;
      }),
      tap({ complete: () => recycleBin.complete() })
    );
  }

  private isDisposed = false;

  /**
   * Dispose the pool
   */
  public async dispose(): Promise<void> {
    this.isDisposed = true;
    await Promise.all(this.createdWorkers.map((worker) => worker.dispose?.()));
  }
}
